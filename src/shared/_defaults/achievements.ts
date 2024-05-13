import { AchievementAttrs } from "../../models/achievements.model";

export const defaultAchievements: AchievementAttrs[] = [
  {
    title: "Новобранец",
    description: "Первый раз зайти в приложение. Команда Stud.log приветствует тебя!",
    imgSrc: '/_defaults/achievements/otlichnik.png',
    condition: {
      entrance: 1
    },
    trophy: {
      avatars: [
        { url:  '/_defaults/avatars/1.svg', color: '#651FFF' },
        { url:  '/_defaults/avatars/2.svg', color: 'var(--accent)' },
        { url:  '/_defaults/avatars/3.svg', color: '#E91E63' },
      ]
    }
  },

  {
    title: "Комментатор от бога",
    description: "Оставить 10 комментариев",
    imgSrc: '/_defaults/achievements/commentator.png',
    condition: {
      comment: 10
    },
    trophy: {
      avatars: [
        { url:  '/_defaults/avatars/1 copy.svg', color: '#651FFF' },
      ]
    }
  },

  {
    title: "Лидер мнений",
    description: "Собрать 10 реакций на комментариях",
    imgSrc: '/_defaults/achievements/lider.png',
    condition: {
      myCommentReacted: 10
    },
    trophy: {
      avatars: [
        { url:  '/_defaults/avatars/1 copy 2.svg', color: '#651FFF' },
      ]
    }
  },

];