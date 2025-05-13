
const urlPrefix = 'https://memo.reverier16.com/api/v1/memos';

document.addEventListener('DOMContentLoaded', async () => {
    if (wishList.length > 0) {
        wishList.forEach( async (item, index) => {
            const url = `${urlPrefix}?filter=tag in ["${item.realNode.todo_tag}"]`;
            const response = await fetch(url);
            const data = await response.json();

            const idStr = `wish-list-index-${index}`;
            const wishListElement = document.getElementById(idStr);
            const fragment = document.createDocumentFragment();
            
            data.memos[0].nodes.forEach((node) => {
                if (node.type === "LIST") {
                    const listChildren = node.listNode.children;
                    listChildren.forEach((child) => {
                        if (child.type === "TASK_LIST_ITEM") {
                            let httpStr = '';
                            if(child.taskListItemNode.complete) {
                                httpStr = `
                                <span class="wish-content">
                                    <input class="wish-box box-checked" type="checkbox" disabled checked>
                                    <span class="wish-text">${child.taskListItemNode.children[0].textNode.content}</span>
                                </span>`;
                            } else {
                                httpStr = `
                                <span class="wish-content">
                                    <input class="wish-box" type="checkbox" disabled>
                                    <span class="wish-text">${child.taskListItemNode.children[0].textNode.content}</span>
                                </span>`;
                            }

                            const li = document.createElement('li');
                            li.className = "wish-list-item";
                            li.innerHTML = httpStr;
                            fragment.appendChild(li);
                            console.log(`${child.taskListItemNode.children[0].textNode.content}${child.taskListItemNode.complete ? 'checked' : "11"}`)
                        }
                    });
                }
            });
            wishListElement.appendChild(fragment);
        });
    }
});