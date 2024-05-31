import { News } from "../models/news.model";
import { Homework } from "../models/homeworks.model";
import { UserComment } from "../models/user-comments.model";
import { Timetable } from "../models/timetable.model";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { IUserReq } from "../shared/interfaces/req";
import { Subject } from "../models/subject.model";
import { Group } from "../models/group.model";
import moment from "moment";
import { logToFile } from "../shared/utils/logToFile";
import 'moment/locale/ru';

interface YaResponse {
  result: {
    alternatives: Alternative[];
    usage: Usage;
    modelVersion: string;
  };
}
  
interface Alternative {
  message: Message;
  status: string;
}
  
interface Message {
  role: string;
  text: string;
}
  
interface Usage {
  inputTextTokens: string;
  completionTokens: string;
  totalTokens: string;
}

class YandexGPTAuthService {
  private apiUrl = 'https://llm.api.cloud.yandex.net';
  private $api: AxiosInstance | null = null;
  private iamToken: { value: null; timer: null; setIamToken: () => Promise<void>; init(): Promise<void>; destroy(): void } = {} as any;

  constructor() {
    this.auth();
  }

  private async auth () {
    await this.initIamRepository();

    this.$api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.iamToken.value,
        'x-folder-id': process.env.YA_FOLDERID
      },
    });
  }

  /**
   * Use this method instead of using $api instance directly
   */
  async yaGet<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if(!this.$api) {
      this.auth();
    }
    try {
      return await this.$api!.get<T>(url, config);
    } catch (e: any) {
      console.log(JSON.stringify(e, null, 4));
      if (e.response && e.response.status == 401) {
        await this.auth(); // Обновляем токен
        // Повторяем запрос с обновленным токеном
        return await this.$api!.get<T>(url, config);
      }
      throw e; // Если другая ошибка, пробрасываем её выше
    }
  }

  /**
   * Use this method instead of using $api instance directly
   */
  async yaPost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if (!this.$api) {
      await this.auth();
    }
    try {
      return await this.$api!.post<T>(url, data, config);
    } catch (e: any) {
      if (e.response && e.response.status === 401) {
        await this.auth(); // Обновляем токен
        // Повторяем запрос с обновленным токеном
        return await this.$api!.post<T>(url, data, config);
      }
      throw e; // Если другая ошибка, пробрасываем её выше
    }
  }

  private async getIamToken() {
    const response = await axios.post<{iamToken: string; expiresAt: string}>('https://iam.api.cloud.yandex.net/iam/v1/tokens', { yandexPassportOauthToken: process.env.YA_OAUTH_TOKEN });
    return response.data;
  }

  private async initIamRepository() {
    const ONE_HOUR = 3600 * 1000;

    this.iamToken = {
      value: null,
      timer: null,
      setIamToken: async () => {
        const { iamToken } = await this.getIamToken();
        (this.iamToken!.value as any) = iamToken;
      },
      async init() {
        await this.setIamToken();

        (this.timer as any) = setInterval(async () => {
          await this.setIamToken();
        }, ONE_HOUR);
      },
      destroy() {
        if (this.timer) {
          clearInterval(this.timer);
        }
      }
    };

    await this.iamToken.init();
  }

}

class YandexGPTService {
  yaApi: YandexGPTAuthService = new YandexGPTAuthService();

  async getDatabase(user: IUserReq['user']) {
    const predicate = { groupId: user.groupId };
    const news = await News.findAll({
      where: predicate,
      attributes: {
        exclude: [ 'id', 'updatedAt', 'createdAt', 'recordId', 'groupId', 'authorId', 'coverImage' ]
      }
    });
    const hws = await Homework.findAll({
      where: predicate,
      include: [ { model: Subject, attributes: { include: [ 'title', 'teacherName' ], exclude: [ 'id', 'shortTitle' ] } } ],
      attributes: {
        exclude: [ 'id', 'updatedAt', 'createdAt', 'recordId', 'groupId', 'subjectId', 'type', 'authorId' ]
      }
    });
    const usercomments = await UserComment.findAll({ where: { ...predicate, isNote: false }, attributes: { exclude: [ 'id', 'updatedAt', 'createdAt', 'userId', 'replyToUserId', 'groupId', 'myRecordId', 'parentId' ] } });
    const timetable = await Timetable.findAll({ where: predicate,
      include: [ { model: Subject, attributes: { include: [ 'title', 'teacherName' ], exclude: [ 'id', 'shortTitle' ] } } ],
      attributes: {
        exclude: [ 'id', 'updatedAt', 'createdAt', 'groupId', 'subjectId' ]
      }
    });
    const formatArray = (title: string, items: any[]): string => {
      return `${title}:\n${items.map((item, index) => `${JSON.stringify(item)}`)}`;
    };
   
    const newsString = formatArray('Новости', news);
    const hwsString = formatArray('Домашние задания', hws);
    const usercommentsString = formatArray('Комментарии', usercomments);
    const timetableString = formatArray('Расписание пар (занятий)', timetable);

    // Combine all formatted strings into one final string
    return ({
      newsString,
      hwsString,
      usercommentsString,
      timetableString
    });
  }

  async prompt(prompt: string, user: IUserReq['user']) {
    try {
      const database = await this.getDatabase(user);
      
      const body = {
        modelUri: `gpt://${ process.env.YA_FOLDERID}/yandexgpt`,
        completionOptions: {
          stream: false,
          temperature: 0,
          maxTokens: "8000"
        },
        messages: [
          {
            "role": "system",
            "text": (`Дай ответ, используя следующие сведения: ${database.newsString}; ${database.hwsString}; 
            ${database.timetableString
                .replaceAll('Mon', 'понедельник')
                .replaceAll('Tue', 'вторник')
                .replaceAll('Wed', 'среда')
                .replaceAll('Thu', 'четверг')
                .replaceAll('Fri', 'пятница')
                .replaceAll('Sat', 'суббота')
                .replaceAll('Sun', 'воскресенье')
                .replaceAll('even', 'по четным')
                .replaceAll('odd', 'по нечетным')
                .replaceAll('both', 'всегда')}; ${database.usercommentsString};`
                + `Если информации среди предоставленных данных нет, напиши: "Не нашел ничего по данному вопросу". В ответе переведи все даты в формат число.месяц часы:минуты. Сегодняшнее число и время ${moment().format('DD.MM.YYYY HH:mm')}. Сегодняшний день недели - ${moment().format('dddd')}. Четность текущей недели - ${moment().week() % 2 ? 'не четная' : 'четная'}.`)
              .replaceAll(/[\\"]/g, '').replaceAll(/\n/g, ' ')
              .replaceAll('startTime', 'время начала')
              .replaceAll('endTime', 'время конца')
              .replaceAll('startDate', 'дата начала')
              .replaceAll('endDate', 'дата конца')
              .replaceAll('weekday', 'день недели')
              .replaceAll('weekparity', 'по каким неделям')
              .replaceAll('classroom', 'аудитория')
              .replaceAll('link', 'ссылка')
              .replaceAll('subject', 'предмет')
              .replaceAll('title', 'название')
              .replaceAll('teacherName', 'имя преподавателя')
              .replaceAll('content', 'контент')
              .replaceAll('label', 'ярлык')
          },
          {
            "role": "user",
            "text": prompt
          }
        ]
      };
      logToFile(body);
      const response = await this.yaApi.yaPost<YaResponse>('/foundationModels/v1/completion', body);
      if(response.data) {
        return response.data.result.alternatives.at(0)?.message.text;
      }
      return "No response generated.";
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  }
}

export default new YandexGPTService();