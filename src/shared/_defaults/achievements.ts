import { AchievementAttrs } from "../../models/achievements.model";

export const defaultAchievements: AchievementAttrs[] = [
  {
    title: "Новобранец",
    description: "Команда Stud.log приветствует тебя!",
    imgSrc: '/_defaults/achievements/otlichnik.png',
    condition: {
      entrance: 1
    },
    trophy: {
      avatars: [
        { url:  '/_defaults/avatars/1.svg' },
        { url:  '/_defaults/avatars/2.svg' },
        { url:  '/_defaults/avatars/3.svg' },
      ]
    }
  },
  {
    title: "Староста группы",
    description: "Сегодня - староста группы, завтра - староста мира",
    imgSrc: '/_defaults/achievements/otlichnik.png',
    condition: {
      mentor: true
    },
    trophy: {
      avatars: [
        { url:  '/_defaults/avatars/1.svg' },
        { url:  '/_defaults/avatars/2.svg' },
        { url:  '/_defaults/avatars/3.svg' },
      ]
    }
  },
  {
    title: "Студент отличник",
    description: "Сходить на все пары в месяце, выполнить все домашки до дедлайна",
    imgSrc: '/_defaults/achievements/otlichnik.png',
    condition: {
      nonAttendance: 0,
      nonPassedHomeworks: 0,
    },
    trophy: {
      avatars: [
        { url:  '/_defaults/avatars/studlog.png' }
      ]
    }
  },
  {
    title: "Комментатор от бога",
    description: "Прокомментировать 10 домашек по любому предмету",
    imgSrc: '/_defaults/achievements/otlichnik.png',
    condition: {
      comment: 10
    },
    trophy: {
      avatars: [
        { url:  '/_defaults/avatars/studlog.png' }
      ]
    }
  },

];