window.onload = function() {
    //实例并初始化WebChat程序
    var webchat = new WebChat();
    webchat.init();
};

//定义WebChat类
var WebChat = function() {
    this.socket = null;
};

//向原型添加业务方法
WebChat.prototype = {
    init: function() {//初始化程序
        var that = this;
        //建立服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，表示连接建立
        this.socket.on('connect', function() {
            //建立连接后，用户名框出现
            document.getElementById('info').textContent = '请输入用户名！';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        this.socket.on('nickExisted', function() {
           //提示用户名已存在，需更换
            document.getElementById('info').textContent = '此用户名已被占用，请更换！';
        });
        this.socket.on('loginSuccess', function() {
            //改变标签页标题
            document.title = 'happychat | ' + document.getElementById('nicknameInput').value;
            //隐藏登录界面
            document.getElementById('loginWrapper').style.display = 'none';
            //使消息输入框获得焦点
            document.getElementById('messageInput').focus();
        });
        //错误处理
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '未连接上';
            } else {
                document.getElementById('info').textContent = '未连接上';
            }
        });
        //系统显示用户状态
        this.socket.on('system', function(nickName, userCount, type) {
            //判断用户是加入还是离开，并显示不同信息
            var msg = nickName + (type == 'login' ? ' 加入聊天' : ' 离开');
            //系统消息默认红色
            that._displayNewMsg('系统 ', msg, 'red');
            //显示当前页面总人数
            document.getElementById('status').textContent = userCount + ' ';
        });
        //显示新消息
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        //显示新图片
        this.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
        });
        //用户名确定按钮
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            //检查用户名是否为空
            if (nickName.trim().length != 0) {
                //不为空，则发起login事件并传递用户名
                that.socket.emit('login', nickName);
            } else {
                //否则重新获取焦点
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        //为用户名输入设置按键控制
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            //如果是Enter键
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        //为发送消息设置点击控制
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            // 如果消息不为空
            if (msg.trim().length != 0) {
                //发送消息到服务器
                that.socket.emit('postMsg', msg, color);
                //在窗口显示消息
                that._displayNewMsg('我', msg, color);
                return;
            };
        }, false);
        //为发送消息设置按键控制
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            //如果输入Enter键且消息不为空
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        document.getElementById('sendImage').addEventListener('change', function() {
            //检查是否有文件被选中
            if (this.files.length != 0) {
                //使用FileReader读取文件
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {
                    that._displayNewMsg('系统', '你的浏览器不支持FileReader！', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    //读取成功
                    this.value = '';
                    //发送到服务器
                    that.socket.emit('img', e.target.result, color);
                    //显示到聊天窗口
                    that._displayImage('me', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        //表情处理
        this._initialEmoji();
        //显示表情窗口
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        //点击其他地方关闭表情窗口
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        //选中表情并发送
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
    },
    //初始化表情
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            //新建文档碎片
            docFragment = document.createDocumentFragment();
        //本系统共设72枚表情
        for (var i = 15; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            //表情附加到文档碎片中
            docFragment.appendChild(emojiItem);
        };
        //一次性加入到表情容器中
        emojiContainer.appendChild(docFragment);
    },
    _displayNewMsg: function(user, msg, color) {
        //定义container用于存储历史消息
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            //添加时间
            date = new Date().toTimeString().substr(0, 8),
            //将消息中的表情装换为gif图片
            msg = this._showEmoji(msg);
        //默认颜色为黑色
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        //为图片加链接包裹
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    //显示表情
    _showEmoji: function(msg) {
        var match, result = msg,
            //正则搜索表情符号
            reg = /\[emoji:\d+\]/g,
            //建立表情索引
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            //查找表情，返回结果
            emojiIndex = match[0].slice(7, -1);
            //超出范围则直接发送表达式
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            //正常发送gif表情
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            };
        };
        return result;
    }
};
