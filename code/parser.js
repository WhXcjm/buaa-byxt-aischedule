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