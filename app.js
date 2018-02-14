const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const formidable = require('formidable');
const path = require('path');

// 将public作为根目录
app.use(express.static('./public'));
// 用'/static' 表示'/static'的绝对路径
app.use('/static', express.static(path.join(__dirname, './static')));  

// 重定向index
app.get('/', (req, res) => {
	res.redirect('/index.html')
})
io.on('connect', (socket) => {
    // 监听sendMessage  信号
	socket.on('sendMessage', (data) => {
		data.id = socket.id;
		console.log('消息', data)
        // 发送receiveMessage信号 让客户端接收
		io.emit('receiveMessage', data)
	})
    // 监听sendImg  信号
	socket.on('sendImg', (data) => {
		data.id = socket.id;
		io.emit('receiveImg', data)
	})
    // 监听 通过ajax方式发送的图片
	socket.on('ajaxImgSendSuccess', (data) => {
        data.id = socket.id;
        data.imgUrl = `/static/images/${data.imgName}`;
        io.emit('receiveAjaxImgSend', data);
    })
})


app.post('/sendimg', (req, res, next) => {
    let imgname = null;
    let form = new formidable.IncomingForm();
    form.uploadDir = './static/images';
    // 当接收到图片数据，保存到相应的文件位置，同时记录图片路径和名称
    form.on('fileBegin', (name, file) => {
        file.path = path.join(__dirname, `./static/images/${file.name}`);
        imgname = file.name;
    });
    form.parse(req, (err, fields, files) => {
        // 将图片名称发送到客户端
        res.send(imgname);
    });
    
});

server.listen(3000,() =>{
	console.log('server running in 127.0.0.1:3000');
})
