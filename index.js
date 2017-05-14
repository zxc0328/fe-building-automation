const Koa = require('koa'),
    Router = require('koa-router'),
    shell = require('shelljs'),
    path = require('path'),
    app = new Koa(),
    router = new Router()

let gitRepo = "https://github.com/Muxi-Studio/MuxiAuth-fe.git"
let projectName = "MuxiAuth-fe"

router.get('/init', function(ctx, next) {
    shell.mkdir('source')
    shell.cd('source')
    console.log('cloning repo...')
    shell.exec('git clone ' + gitRepo, () => {
        console.log('Repo Cloned')
        console.log('npm installing...')
        shell.cd(projectName)
        shell.exec('npm install --registry=https://registry.npm.taobao.org', function(code, stdout, stderr) {
            console.log('Exit code:', code)
            console.log('Program output:', stdout)
            console.log('Program stderr:', stderr)
            console.log('Building')
            shell.exec('npm run build', function(code, stdout, stderr) {
                console.log('Exit code:', code)
                console.log('Program output:', stdout)
                console.log('Program stderr:', stderr)
            })
        })

    })
    ctx.body = 'finished'
});

router.get('/update', function(ctx, next) {
    shell.cd('source/' + projectName)
    console.log("Now in source/" + projectName)
    console.log("Pulling code")
    shell.exec('git pull ' + gitRepo, () => {
        console.log("git pull successful")
        console.log("building")
        shell.exec('npm run build', function(code, stdout, stderr) {
            console.log('Exit code:', code)
            console.log('Program output:', stdout)
            console.log('Program stderr:', stderr)
            console.log("building successful")
            console.log("compressing")
            shell.exec("tar -cvf bundle.tar ./static", function(code, stdout, stderr) {
            	  shell.rm('-rf', '../../release/*')
            	  shell.mv('bundle.tar', '../../release/')
                console.log('Exit code:', code)
                console.log('Program output:', stdout)
                console.log('Program stderr:', stderr)
                console.log("compressing successful")
                console.log("all done")
            })
        })
    })
    ctx.body = 'finished'
});

router.get('/getCode', function(ctx, next) {

    ctx.body = 'finished'
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000)

module.exports = app
