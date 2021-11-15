import express = require('express');
import bodyParser = require('body-parser');
import { MonacoContent } from './monacocontent';
import { User } from './User';


export class MonacoBackend {

    increment: number = 0;

    Users: User[] = [];
    EditorContent: string =
`function Run() 
{
    return 'Hello World!';
}`;

    Current_Version: number = 0;
    expressApp:express.Application;

    constructor() {

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

    UpdateUsers(ID: number, name: string, is_editor: boolean, line_number: number) {
        try {
            let to_remove: User[] = [];
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

            if (!found){
                this.Users.push({
                    id: ID,
                    last_updated: new Date(),
                    is_editor: is_editor,
                    line_number: line_number,
                    name: name
                });
            }
            
            this.Users = this.Users.filter((user)=>{
                let findUser = to_remove.find((u)=>{return u.id==user.id;})
                if (findUser)
                    return false;
                else
                    return true;
            })

        }
        catch(error) { }

    }

    parseBoolean(boolString:string):boolean{
        if (boolString=='true')
            return true;
        else
            return false;
    }

    GetMonacoContent(req:express.Request, res:express.Response) {
        let id: number = parseInt(<string>req.query.id);
        let is_editing: boolean = this.parseBoolean(<string>req.query.is_editing);
        let line_number: number = parseInt(<string>req.query.line_number);
        let name: string = <string>req.query.name;

        let return_content: MonacoContent = new MonacoContent();

        this.UpdateUsers(id, name, is_editing, line_number);
        return_content.num_viewers = this.Users.length;
        return_content.num_editors = this.Users.filter((viewer) => {return viewer.is_editor}).length;
        return_content.users = this.Users;

        return_content.content = this.EditorContent;
        return_content.current_version = this.Current_Version;


        res.json(return_content);
    }

    PostMonacoContent(req:express.Request, res:express.Response) {
        let monContent:MonacoContent = <MonacoContent>req.body;
        let return_content:MonacoContent = new MonacoContent();
        this.UpdateUsers(monContent.id, monContent.name, true,monContent.line_number);
        return_content.num_viewers = this.Users.length;
        return_content.num_editors = this.Users.filter((viewer) => {return viewer.is_editor}).length;
        return_content.users = this.Users;

        if (monContent.current_version==this.Current_Version)
        {
            this.EditorContent = monContent.content;
            this.Current_Version++;
            return_content.current_version = this.Current_Version;
        }
        else
            return_content.current_version=-1;
        
        res.json(return_content);
    }

}

var monacoBackend = new MonacoBackend();
monacoBackend.runExpress();
