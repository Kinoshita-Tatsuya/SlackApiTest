const token = "dummy";
const channelID = "CB74M5Y6B";
let userMap = new Map();
const myID = "UB6K2GA4D"

const GetMessages = ts =>
{
    let xhr = new XMLHttpRequest();
    xhr.onload = () =>
    {
        const responseCH = JSON.parse(xhr.responseText);
        ShowMessages(responseCH);

        if(responseCH.has_more)
        {
            const length = responseCH.messages.length;
            const ts = responseCH.messages[length - 1].ts;
            GetMessages(ts);
        }
    };

    xhr.open("GET",GetChannelHistory(ts),true);
    xhr.send(null);
}

const ShowMessages = response =>
{
    const messages = response.messages; 

    for(let i = 0; i <messages.length;++i)
    {
        const userId = messages[i].user;

        if(myID === userId)
        {
            CreateMyCommentDivs(messages[i]);
            continue;
        }
        
        CreateOtherUserCommentDivs(userId ,messages[i]);
    }
}

const IsBot = (message) =>
{
    return message.hasOwnProperty("username");
}

const CreateMyCommentDivs =  message =>
{
    let myCommentFrame = document.createElement("div");
    myCommentFrame.classList.add("myCommentFrame");

    let myComment = document.createElement("div");
    myComment.classList.add("myComment");
    myComment.textContent = message.text;

    ShowPostTime(message.ts,myComment);
    myCommentFrame.appendChild(myComment);

    let messagesBox = document.querySelector(".messageBox");
    messagesBox.appendChild(myCommentFrame);

}

const CreateOtherUserCommentDivs = (userId, message) =>
{
    //アイコン表示
    let iconElm = document.createElement("img");
    const image = (IsBot(message))? null :userMap.get(userId).profile.image_192;
    iconElm.setAttribute("src", image);
    iconElm.classList.add("icon");
    
    //吹き出し表示
    let chatElm = document.createElement("div");
    chatElm.classList.add("chat");

    //テキストの表示
    let textElm = document.createElement("div");
    textElm.classList.add("othersComment");
    textElm.textContent = message.text;

    //ユーザーの名前表示
    let userNameElm = document.createElement("div");
    userNameElm.classList.add("userName");
    const name = (IsBot(message))? message.username : userMap.get(userId).real_name;
    userNameElm.textContent = name;

    let messagesBox = document.querySelector(".messageBox");
    chatElm.append(iconElm);
    chatElm.append(userNameElm);
    chatElm.appendChild(textElm);
    messagesBox.appendChild(chatElm);

    ShowPostTime(message.ts,chatElm);
}

const ShowPostTime = (ts, elm) =>
{
    let date = new Date(ts * 1000);
    const month = date.getMonth() + 1; //戻り値が０から始まるため+1
    const day = date.getDate();
    const hour = date.getHours();
    let min = date.getMinutes();

    if(min < 10)
    {
        min = "0" + min.toString();
    }

    let postTime = document.createElement("div");
    postTime.classList.add("PostTime");
    postTime.innerText = `${month}/${day} ${hour}:${min}`

    elm.appendChild(postTime);
}

const GetChannelHistory = ts =>
{
    let url = `https://slack.com/api/channels.history?token=${token}&channel=${channelID}&count=${10}`;

    if(ts)
    {
        url += `&latest=${ts}`;   
    }
    else
    {
        url += `&latest=${Date.now()}`;
    }

    return url;
}

const CreateUserMap = () =>
{
    const url = `https://slack.com/api/users.list?token=${token}`;

    let xhr = new XMLHttpRequest();

    xhr.open("GET",url,false);
    xhr.send(null);

    let response = JSON.parse(xhr.responseText);    
    for(let i = 0;i < response.members.length;++i)
    {
        userMap.set(response.members[i].id,response.members[i]);
    }
}

const sendMessage = () =>
{
    let textarea = document.getElementById("SendBox");
    const url = `https://slack.com/api/chat.postMessage?token=${token}&channel=${channelID}&text=${textarea.value}`;
    let xhr = new XMLHttpRequest();
    
    xhr.open("GET",url,false);
    xhr.send(null);   
    
    textarea.value = "";

    location.reload();
}

const getChannelName = () =>
{
    const url = `https://slack.com/api/channels.info?token=${token}&channel=${channelID}`;
    let xhr = new XMLHttpRequest();

    let header = document.getElementById("header");
    let elem = document.createElement("p");

    xhr.open("GET",url,false);
    xhr.send(null);

    let response = JSON.parse(xhr.responseText); 

    elem.innerHTML = response.channel.name.toString();

    header.appendChild(elem);
}

window.onload = () =>
{
    getChannelName();
    CreateUserMap();
    GetMessages(Date.now());
}
