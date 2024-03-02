async function scheduleHtmlProvider(
    dom = document
) {
    let schoolTable = dom.getElementsByClassName("schoolTable___2pFP9")[0];
    if (schoolTable) {
        return schoolTable.outerHTML;
    } else {
        console.error("未找到课程表元素。");
        return 'do not continue';
    }
}