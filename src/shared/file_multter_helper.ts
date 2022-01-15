import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';

export class FileMulterHelper {
  static customFileName(req, file, cb) {
    let customFile = file.originalname.split('.')[0];
    customFile =
      customFile + Date.now() + '-' + Math.round(Math.random() * 1e9);
    let fileExtension = '';
    /* if (file.mimetype.indexOf("jpeg") > -1) {
            fileExtension = ".jpeg";
        } else if (file.mimetype.indexOf("png") > -1) {
            fileExtension = ".png";
        } else {
            fileExtension = "." + file.mimetype.split("/")[1];
        }
        
*/
    let originalName = file.originalname;
    fileExtension = originalName.substring(
      originalName.lastIndexOf('.'),
      originalName.length,
    );

    customFile = customFile + fileExtension;
    cb(null, customFile);
  }
  static filePathTempImage(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.TEMP);
  }


  
}
