/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
async function scheduleTimer({ providerRes, parserRes } = {}, dom = document) {
  //周数，包括两周考试周，春18秋19夏9
  let totalWeek = 19, year = 2024;
  const seasonSpan = dom.querySelector('span.ant-select-selection-item[title$="季"]');
  if (seasonSpan) {
    const title = seasonSpan.getAttribute('title');
    const yearMatch = title.match(/\d{4}/); // 匹配4位数字年份
    const seasonMatch = title.match(/(春季|夏季|秋季)/); // 匹配季节
    year = yearMatch ? yearMatch[0] : '未知';
    season = seasonMatch ? seasonMatch[0] : '未知';
    switch (season) {
      case '春季':
        totalWeek = 18;
        break;
      case '夏季':
        totalWeek = 9;
        break;
      case '秋季':
        totalWeek = 19;
        break;
      // 如果需要，可以添加冬季的情况
    }
    console.log(`年份: ${year}, 季节: ${season}, 总周数: ${totalWeek}`);

    //课程时间
    const sections = [
      {
        section: 1,
        startTime: "08:00",
        endTime: "08:45",
      },
      {
        section: 2,
        startTime: "08:50",
        endTime: "09:35",
      },
      {
        section: 3,
        startTime: "09:50",
        endTime: "10:35",
      },
      {
        section: 4,
        startTime: "10:40",
        endTime: "11:25",
      },
      {
        section: 5,
        startTime: "11:30",
        endTime: "12:15",
      },
      {
        section: 6,
        startTime: "14:00",
        endTime: "14:45",
      },
      {
        section: 7,
        startTime: "14:50",
        endTime: "15:35",
      },
      {
        section: 8,
        startTime: "15:50",
        endTime: "16:35",
      },
      {
        section: 9,
        startTime: "16:40",
        endTime: "17:25",
      },
      {
        section: 10,
        startTime: "17:30",
        endTime: "18:15",
      },
      {
        section: 11,
        startTime: "19:00",
        endTime: "19:45",
      },
      {
        section: 12,
        startTime: "19:50",
        endTime: "20:35",
      },
      {
        section: 13,
        startTime: "20:40",
        endTime: "21:25",
      },
      {
        section: 14,
        startTime: "21:30",
        endTime: "22:15",
      },
    ];
    
    // 提取开学日期
    const dayTimeElement = dom.querySelector('.dayTime___2lyND');
    const weekInfoElement = dom.querySelector('.yan___tHtVu');
    const currentWeekText = weekInfoElement.textContent.trim();
    const currentWeek = parseInt(currentWeekText.match(/\d+/)[0]);
    const dayTimeText = dayTimeElement.textContent.trim();
    const month = parseInt(dayTimeText.split('月')[0]);
    const day = parseInt(dayTimeText.split('月')[1].split('日')[0]);

    const currentDate = new Date();
    const serverDate = new Date(currentDate.getFullYear(), month - 1, day);
    diffDays = (serverDate.getDay() + 6) % 7;
    const mondayDate = new Date(serverDate.getTime() - diffDays * 24 * 60 * 60 * 1000);
    const firstWeekMonday = new Date(mondayDate.getTime() - (currentWeek - 1) * 7 * 24 * 60 * 60 * 1000);
    const startSemesterTimestamp = firstWeekMonday.getTime()

    return {
      totalWeek: totalWeek, // 总周数：[1, 30]之间的整数
      startSemester: startSemesterTimestamp, // 开学时间：时间戳，13位长度字符串，推荐用代码生成
      startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
      showWeekend: true, // 是否显示周末
      forenoon: 5, // 上午课程节数：[1, 10]之间的整数
      afternoon: 5, // 下午课程节数：[0, 10]之间的整数
      night: 4, // 晚间课程节数：[0, 10]之间的整数
      sections: sections, // 课程时间表，注意：总长度要和上边配置的节数加和对齐
    };
  }
}