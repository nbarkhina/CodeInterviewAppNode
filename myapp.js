"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const monacocontent_1 = require("./monacocontent");
class MonacoBackend {
    constructor() {
        this.increment = 0;
        this.Users = [];
        this.EditorContent = `function Run() 
{
    return 'Hello World!';
}`;
        this.Current_Version = 0;
    }
    runExpress() {
        this.expressApp = express();
        var thisRef = this;
        //need this in order to use app.post()
        this.expressApp.use(bodyParser.json()); // support json encoded bodies
        this.expressApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        this.expressApp.use('/', express.static(__dirname + '/wwwroot', {
            index: 'index.html'
        }));
        this.expressApp.use('/node_modules', express.static(__dirname + '/node_modules'));
        this.expressApp.get('/api/GetMaddy', function (req, res) {
            thisRef.GetMaddy(req, res);
        });
        this.expressApp.get('/api/values/GetMonacoContent', function (req, res) {
            thisRef.GetMonacoContent(req, res);
        });
        this.expressApp.post('/api/values/PostMonacoContent', function (req, res) {
            thisRef.PostMonacoContent(req, res);
        });
        const port = process.env.PORT || 5500;
        this.expressApp.listen(port);
        console.log('server running');
    }
    GetMaddy(req, res) {
        console.log('Get Maddy Function');
        this.increment++;
        res.json({ firstname: 'Maddy', lastname: 'Barkhina' + this.increment });
    }
    UpdateUsers(ID, name, is_editor, line_number) {
        try {
            let to_remove = [];
            let found = false;
            this.Users.forEach(user => {
                if (user.id == ID) {
                    user.last_updated = new Date();
                    user.is_editor = is_editor;
                    user.line_number = line_number;
                    found = true;
                }
                let dateCompare = new Date(user.last_updated.getTime());
                dateCompare.setSeconds(dateCompare.getSeconds() + 30);
                let now = new Date();
                if (dateCompare < now)
                    to_remove.push(user);
            });
            if (!found) {
                this.Users.push({
                    id: ID,
                    last_updated: new Date(),
                    is_editor: is_editor,
                    line_number: line_number,
                    name: name
                });
            }
            this.Users = this.Users.filter((user) => {
                let findUser = to_remove.find((u) => { return u.id == user.id; });
                if (findUser)
                    return false;
                else
                    return true;
            });
        }
        catch (error) { }
    }
    parseBoolean(boolString) {
        if (boolString == 'true')
            return true;
        else
            return false;
    }
    GetMonacoContent(req, res) {
        let id = parseInt(req.query.id);
        let is_editing = this.parseBoolean(req.query.is_editing);
        let line_number = parseInt(req.query.line_number);
        let name = req.query.name;
        let return_content = new monacocontent_1.MonacoContent();
        this.UpdateUsers(id, name, is_editing, line_number);
        return_content.num_viewers = this.Users.length;
        return_content.num_editors = this.Users.filter((viewer) => { return viewer.is_editor; }).length;
        return_content.users = this.Users;
        return_content.content = this.EditorContent;
        return_content.current_version = this.Current_Version;
        res.json(return_content);
    }
    PostMonacoContent(req, res) {
        let monContent = req.body;
        let return_content = new monacocontent_1.MonacoContent();
        this.UpdateUsers(monContent.id, monContent.name, true, monContent.line_number);
        return_content.num_viewers = this.Users.length;
        return_content.num_editors = this.Users.filter((viewer) => { return viewer.is_editor; }).length;
        return_content.users = this.Users;
        if (monContent.current_version == this.Current_Version) {
            this.EditorContent = monContent.content;
            this.Current_Version++;
            return_content.current_version = this.Current_Version;
        }
        else
            return_content.current_version = -1;
        res.json(return_content);
    }
}
exports.MonacoBackend = MonacoBackend;
var monacoBackend = new MonacoBackend();
monacoBackend.runExpress();
//# sourceMappingURL=myapp.js.map