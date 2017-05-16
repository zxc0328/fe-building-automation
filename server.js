var express = require('express');
var app = express();
var server = require('http').Server(app);
var socket = require('socket.io')(server);
var shell = require('shelljs');

var buildingFlag = false;
server.listen(3000);

let gitRepo = "https://github.com/Muxi-Studio/MuxiAuth-fe.git"
let projectName = "MuxiAuth-fe"

app.use('/static', express.static('lib'))

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/getCode/:hash', function(req, res) {
    res.sendfile(__dirname + '/release/' + req.params.hash + ".tar");
});

var sendMessage = function(message) {
    socket.emit('message', {
        content: message
    });
}

socket.on('connection', function(socket) {

    socket.on("update", function() {
    	  if (buildingFlag) {
    	  	sendMessage("Already Building")
    	  	return
    	  }
    	  buildingFlag = true
        var fileHash;
        shell.cd('source/' + projectName)
        console.log("Now in source/" + projectName)
        console.log("Pulling code")
        sendMessage("Pulling code")
        shell.exec('git pull ' + gitRepo, (code, stdout, stderr) => {
            sendMessage("git pull successful")
            sendMessage("building")
            shell.exec('git rev-parse HEAD', (code, stdout, stderr) => {
                fileHash = stdout.slice(0, stdout.length - 1) // remove \n
                shell.exec('npm run build', function(code, stdout, stderr) {
                    console.log('Exit code:', code)
                    console.log('Program output:', stdout)
                    console.log('Program stderr:', stderr)
                    sendMessage("building successful")
                    sendMessage("compressing")
                    shell.exec("tar -cvf " + fileHash + ".tar ./static", function(code, stdout, stderr) {
                        shell.rm('-rf', '../../release/*')
                        shell.mv(fileHash + '.tar', '../../release/')
                        console.log('Exit code:', code)
                        console.log('Program output:', stdout)
                        console.log('Program stderr:', stderr)
                        sendMessage("compressing successful")
                        sendMessage("all done")
                        sendMessage("Bundled Code here:/getCode/"+fileHash)
                        buildingFlag = false
                    })
                })
            })
        })
    })

});
