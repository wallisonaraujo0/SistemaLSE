import multer from "multer";
import path from "path"
export const upload = multer({
    dest:path.resolve("src", "temp"),
    fileFilter: (req,file,cb) => {
        const allowed = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ]
        cb(null, allowed.includes(file.mimetype))
    },
    limits: {fieldSize: 2000000}
})