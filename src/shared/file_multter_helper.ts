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
  static filePathTempBranch(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_BRANCH);
  }

  static filePathTempAgent(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT);
  }
  static filePathTempCustomer(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER);
  }
  static filePathTempEmployee(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_EMPLOYEE);
  }
  static filePathTempSupplier(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_SUPPLIER);
  }
  static filePathTempStone(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_STONE);
  }
  static filePathTempCategory(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_CATEGORY);
  }
  static filePathTempSubCategory(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.GLOBAL_GALLERY_SUB_CATEGORY);
  }
  static filePathChatDocuments(req, file, cb) {
    cb(null, UploadedFileDirectoryPath.CHAT_DOCUMENTS);
  }

  static filePathGlobalGalleries(req, file, cb) {
    var document_location = '';

    console.log("req.body.type  "+JSON.stringify(req.body));

    switch (Number(req.body.type)) {
      case 0:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_CATEGORY;
        break;
      case 1:
        document_location =
          UploadedFileDirectoryPath.GLOBAL_GALLERY_SUB_CATEGORY;
        break;
      case 2:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_STONE;
        break;
      case 3:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT;
        break;
      case 4:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_BRANCH;
        break;
      case 5:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_EMPLOYEE;
        break;
      case 6:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_SUPPLIER;
        break;
      case 7:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER;
        break;
      default:
        document_location = UploadedFileDirectoryPath.GLOBAL_GALLERY_OTHERS;
        break;
    }
    cb(null, document_location);
  }
}
