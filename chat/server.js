//服务器部分代码
var express = require('express'),
    app = express(),
    //引入Express框架及Socket.io
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    //保存所有在线用户的用户名
    users = [];
//指定使用的html
app.use('/', express.static(__dirname + '/www'));
//本地绑定3000端口
server.listen(3000);//for local test
//server.listen(process.env.PORT || 3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
console.log('server started on port'+process.env.PORT || 3000);
//socket部分
io.sockets.on('connection', function(socket) {
    //新用户登录，用户名处理
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            //将用户名压入users数组
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //用户退出
    socket.on('disconnect', function() {
        //将断开的用户从user表中删除
        users.splice(socket.userIndex, 1);
        //向全体成员广播退出操作
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //发送消息
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //发送图片
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});