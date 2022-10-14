import path from "path"
import fs from "fs"

class planilhaServices {
    constructor () {}
    async planilhaUploadService (file, name) {
        try {
        fs.writeFile(path.resolve("src", "planilhas", name), fs.readFileSync(file.path), err => { 
            if (err) {
                throw new Error(err)
            } else {
                console.log("Planilha Salvo");
            }
        });
          deleteFolderRecursive(path.resolve("src", "temp"))
           return {upload: name}
        }catch (err) {
            return err
        }
       }
}
export default planilhaServices
var deleteFolderRecursive = function(path) {
    try {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file) {
              var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
          }
    }catch (err) {
        return
    }
  }
