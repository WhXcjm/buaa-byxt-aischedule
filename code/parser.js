function scheduleHtmlParser(html) {
  /** 课程信息 */
  let courseInfos = [];

  $('.kbappTimetableDayColumnRoot___1DlDV').each(function (dayIndex) {
    $(this).find('.kbappTimetableCourseRenderCourseItem___MgPtp').each(function () {
      const courseName = $(this).find('.title___3o2RH').text().trim(); // 课程名称
      // const courseCode = $(this).find('.courseCode___DrIml').text().trim(); // 课程代码
      const teacherAndWeeksArray = $(this).find('.kbappTimetableCourseRenderCourseItemInfoText___2Zmwu').eq(0).text().trim().split(' '); // 教师信息和周数
      const location = $(this).find('.kbappTimetableCourseRenderCourseItemInfoText___2Zmwu').eq(1).text().trim(); // 教室位置
      const sections = $(this).find('.kbappTimetableCourseRenderCourseItemInfoText___2Zmwu').eq(2).text().trim(); // 节数

      const sectionsArray = getSections(sections); // 使用 getSections 解析节数组
      // 根据实际情况解析教师信息、周数、教室位置和节数

      //需修改
      teacherAndWeeksArray.forEach(function (teacherAndWeeks) {
        // 分割教师名和周数
        const teacher = teacherAndWeeks.split('[')[0];
        const weeksStr = '[' + teacherAndWeeks.split('[')[1];

        const weeks = getWeeks(weeksStr); // 使用 getWeeks 解析周数

        // 构造课程信息对象
        const courseInfo = {
          name: courseName,
          position: location,
          // code: courseCode,
          teacher: teacher, // 假设教师名在周数信息之前
          weeks: weeks,
          day: dayIndex + 1, // 添加星期信息
          sections: sectionsArray,
        };

        // 添加到课程信息数组
        courseInfos.push(courseInfo);
      });
    });
  });
  return courseInfos;
}

/**
 * 获取cheerio解析的元素文本
 * @param element cheerio解析的元素
 * @returns {Array<string>} 元素文本列表
 */
function getText(element) {
  let ele = element;
  const text = [];
  while (ele) {
    if (ele.children) {
      ele = ele.children[0];
    } else if (ele.data) {
      text.push(ele.data);
      ele = ele.next;
    }
  }
  return text;
}

/**
 * 提取课程周数
 * @param {string} str 包含周数的字符串，如`[1-9，11周]`、`12，14周`、`[2-8双周，12，14双周]`、`[14周]`
 * @returns {Array<number>} 包含`str`中所有周数的数组
 */
function getWeeks(str) {
  let weeks = [];
  str = str.split("[")[1].split("]")[0].replace(/周/g, "");
  let weekArray = str.split(/[，,]/).map(part => part.trim());
  for (let i in weekArray) {
    const parts = weekArray[i].split("-");
    const begin = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : begin;

    for (let j = begin; j <= end; j++) {
      if (weekArray[i].includes("双") && j % 2 === 0) {
        weeks.push(j);
      } else if (weekArray[i].includes("单") && j % 2 === 1) {
        weeks.push(j);
      } else if (!weekArray[i].includes("双") && !weekArray[i].includes("单")) {
        weeks.push(j);
      }
    }
  }
  return weeks;
}

/**
 * 提取课程节数，解析连续节数范围（如"3-5节"），并返回包含所有节数的数组。
 * @param {string} str 包含节数的字符串
 * @returns {Array<number>} 包含str中所有节数的数组
 */
function getSections(str) {
  let sections = [];
  let match = str.match(/(\d+)-(\d+)节/);
  if (match) {
    let start = parseInt(match[1]);
    let end = parseInt(match[2]);
    for (let i = start; i <= end; i++) {
      sections.push(i);
    }
  }
  return sections;
}

/**
 * 获取单节课程信息
 *
 * 0: "电子工程技术训练"
 *
 * 1: "王虹霞[1-9]周沙河工训\n第1，2节"
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info 课程信息字符串
 * @returns {object} 课程信息
 */
function getLesson(lessonName, day, info) {
  let lesson = { sections: getSections(info), weeks: getWeeks(info) };
  lesson.name = lessonName;
  lesson.day = day;
  lesson.teacher = info.split("[")[0].replace(/\s+/g, ""); //去掉空格，多教师只提取第一个
  //提取教室
  tmp = info.split("周");
  lesson.position = tmp[tmp.length - 1].split("\n")[0];

  return lesson;
}

/**
 * 获取 3 行课程信息（同一课程被拆分为多节课）
 *
 * 0: "围棋基础（1）(待生效)"
 *
 * 1: "薛  峰[11]周，[3-10]周"
 *
 * 2: "J3-411\n第11，12节"
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info1 课程信息（不含教室，第一行）
 * @param {string} info2 教室（第二行）
 * @returns {Array<object>} 课程信息
 */
function getLessons3(lessonName, day, info1, info2) {
  let lessons = [];
  let position = info2.split("\n")[0];
  let sections = getSections(info2);
  let allWeeks = info1.split("周，");
  const teacher = allWeeks[0].split("[")[0].replace(/\s+/g, ""); //去掉空格
  for (i in allWeeks) {
    let lesson = { sections: sections, weeks: getWeeks(allWeeks[i]) };
    lesson.name = lessonName;
    lesson.day = day;
    lesson.teacher = allWeeks[i].split("[")[0].replace(/\s+/g, ""); //去掉空格
    if (!lesson.teacher) {
      // 如果没有解析到教师，则使用第一个教师
      lesson.teacher = teacher;
    }
    lesson.position = position;
    lessons.push(lesson);
  }
  return lessons;
}

/**
 * 获取多节课程信息（同一老师不同教室， 如`张老师[10-13]周机房 第1，2节，[2-9]周（五）111 第1，2节`）
 * @param {string} lessonName 课程名
 * @param {number} day 星期
 * @param {string} info 课程信息字符串
 * @returns {Array<object>} 课程信息
 */
function getLessons2(lessonName, day, info) {
  let lessons = [];
  let teacher = info.split("[")[0].replace(/\s+/g, ""); //去掉空格
  let weekArray = info.split("\n");
  let n = weekArray.length;
  for (let i = 0; i < n - 1; i++) {
    let lesson = {
      sections: getSections(weekArray[i + 1]),
      weeks: getWeeks(weekArray[i]),
    };
    lesson.name = lessonName;
    lesson.day = day;
    lesson.teacher = teacher;
    lesson.position = weekArray[i].split("周")[1];
    lessons.push(lesson);
  }
  return lessons;
}

/**
 * 获取多节课程信息（同一课程被拆分为不同老师不同教室）
 *
 * 0: "基础物理实验(1)"
 *
 * 1: "陈  彦[3-17]周"
 *
 * 2: "物理教学与实验中心\n第6，7节，唐  芳[3-17]周"
 *
 * 3: "物理教学与实验中心\n第6，7节，王文玲[2]周"
 *
 * 4: "(一)30\n第6，7节，王文玲[3-17]周"
 *
 * 5: "物理教学与实验中心\n第6，7节，熊  畅[3-17]周"
 *
 * 6: "物理教学与实验中心\n第6，7节，徐  平[3-17]周"
 *
 * 7: "物理教学与实验中心\n第6，7节，严琪琪[3-17]周"
 *
 * 8: "物理教学与实验中心\n第6，7节，赵  路[3-17]周"
 *
 * 9: "物理教学与实验中心\n第6，7节"
 *
 * ---
 *
 * 0: "走进软件"
 *
 * 1: "葛 宁[2，3，5，8，10，14]周"
 *
 * 2: "J3-312\n第11，12节，李祺[2，4，12，14双]周"
 *
 * 3: "J3-312\n第11，12节，于 茜[2，7-12单，13，14]周"
 *
 * 4: "机房\n第11，12节，张 莉[2，14双]周"
 *
 * 5: "J3-312\n第11，12节"
 *
 * @param {string} text 课程信息
 * @param {number} day 星期
 * @returns {Array<object>} 课程信息
 */
function getLessonsN(text, day) {
  console.info(text);
  let lessons = [];
  const lessonName = text[0];
  for (let i = 1; i < text.length - 1; i++) {
    let position, sections, weeks;
    try {
      position = text[i + 1].split("\n")[0];
    } catch (error) {
      console.error("上课地点解析错误", text[i + 1]);
    }
    try {
      sections = getSections(text[i + 1].split("\n")[1].split("节")[0] + "节");
    } catch (error) {
      console.error("上课节数解析错误", text[i + 1]);
    }
    try {
      weeks = getWeeks(
        [...text[i].matchAll(/[\[0-9-，单双\]]+(?=周)/g)].pop()[0]
      );
    } catch (error) {
      console.error("上课周数解析错误", text[i]);
    }
    lessons.push({
      name: lessonName,
      day: day,
      teacher: getTeacher(text[i]),
      position: position,
      sections: sections,
      weeks: weeks,
    });
  }
  return lessons;
}

/**
 * 获取超过 3 行课程信息
 *
 * 0: "数据结构(实验)"
 *
 * 1: "刘  博[16，17]周学院教学实验室-航天工程综合实验与创新中心（主楼D306）\n第3，4节"
 *
 * 2: "数据结构"
 *
 * 3: "刘  博[10-15]周，谢凤英[1-9]周"
 *
 * 4: "J4-206\n第3，4节"
 *
 * ---
 *
 * 0: "基础物理实验(1)"
 *
 * 1: "陈  彦[3-17]周"
 *
 * 2: "物理教学与实验中心\n第6，7节，唐  芳[3-17]周"
 *
 * 3: "物理教学与实验中心\n第6，7节，王文玲[2]周"
 *
 * 4: "(一)30\n第6，7节，王文玲[3-17]周"
 *
 * 5: "物理教学与实验中心\n第6，7节，熊  畅[3-17]周"
 *
 * 6: "物理教学与实验中心\n第6，7节，徐  平[3-17]周"
 *
 * 7: "物理教学与实验中心\n第6，7节，严琪琪[3-17]周"
 *
 * 8: "物理教学与实验中心\n第6，7节，赵  路[3-17]周"
 *
 * 9: "物理教学与实验中心\n第6，7节"
 *
 * ---
 *
 * 0: "走进软件"
 *
 * 1: "葛 宁[2，3，5，8，10，14]周"
 *
 * 2: "J3-312\n第11，12节，李祺[2，4，12，14双]周"
 *
 * 3: "J3-312\n第11，12节，于 茜[2，7-12单，13，14]周"
 *
 * 4: "机房\n第11，12节，张 莉[2，14双]周"
 *
 * 5: "J3-312\n第11，12节"
 *
 * @param {Array<string>} text 原始文本
 * @param {number} day 星期
 * @returns {Array<object>} 课程信息
 */
function getLessons(text, day) {
  let lessons = [];
  let infos = [];
  let info = [];
  let isPrevLineSecOrWeek = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i].indexOf("节") > -1 || text[i].indexOf("周") > -1) {
      // 该行包含节次或周次信息
      isPrevLineSecOrWeek = true;
    } else {
      // 该行不包含节次或周次信息
      if (isPrevLineSecOrWeek) {
        // 上一行包含节次或周次信息
        infos.push(info);
        info = [];
        isPrevLineSecOrWeek = false;
      }
    }
    info.push(text[i]);
    if (i === text.length - 1) {
      infos.push(info);
    }
  }
  for (const i of infos) {
    if (i.length === 2) {
      lessons.push(getLesson(i[0], day, i[1]));
    } else if (i.length === 3) {
      const l = getLessons3(i[0], day, i[1], i[2]);
      for (const j of l) {
        lessons.push(j);
      }
    } else {
      const l = getLessonsN(text, day);
      for (const j of l) {
        lessons.push(j);
      }
    }
  }
  return lessons;
}
