const token = "xoxp-380106888994-381209183639-699184962310-c69918f112a9b8e6b2612ea8ebd7ca27";
const channelID = "CB74M5Y6B";
let userMap = new Map();

const GetMessages = ts =>
{
    let xhr = new XMLHttpRequest();
    xhr.onload = () =>
    {
        let responseCH = JSON.parse(xhr.responseText);
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

        if(userMap.get(userId).profile.real_name === "Kinoshita Tatsuya")
        {
            CreateMyCommentDivs(userId ,messages[i]);
            continue;
        }
        
        CreateOtherUserCommentDivs(userId ,messages[i]);
    }
}

const CreateMyCommentDivs =  message =>
{
    let myComment = document.createElement("div");
    myComment.classList.add("myComment");
    myComment.textContent = message.text;

    let messagesBox = document.querySelector(".messageBox");
    messagesBox.appendChild(myComment);

    ShowPostTime(message.ts,myComment);
}

const CreateOtherUserCommentDivs = (userId, message) =>
{
    //アイコン表示
    let iconElm = document.createElement("img");
    iconElm.setAttribute("src",userMap.get(userId).profile.image_192);
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
    userNameElm.textContent = userMap.get(userId).real_name;

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
    let month = date.getMonth();
    let day = date.getDay();
    let hour = date.getHours();
    let min = date.getMinutes();

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
    let url = `https://slack.com/api/users.list?token=${token}`;

    let xhr = new XMLHttpRequest();

    xhr.onload= () =>
    {
        let response = JSON.parse(xhr.responseText);    
        for(let i = 0;i < response.members.length;++i)
        {
            userMap.set(response.members[i].id,response.members[i]);
        }
    }

    xhr.open("GET",url,true);
    xhr.send(null);
}

const sendMessage = () =>
{
    let textarea = document.getElementById("SendBox");
    let url = `https://slack.com/api/chat.postMessage?token=${token}&channel=CD3LD7M2L&text=${textarea.value}`;
    let xhr = new XMLHttpRequest();
    
    xhr.open("GET",url,false);
    xhr.send(null);   
    
    textarea.value = "";

    location.reload();
}

window.onload = () =>
{
    CreateUserMap();
    GetMessages(Date.now());
}