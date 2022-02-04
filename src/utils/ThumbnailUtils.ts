
import * as sharp from 'sharp';
import { GlobalConfig } from 'src/config/global_config';
var sizeOfImage = require('image-size');
export class ThumbnailUtils {
  
   async  generateThumbnail(inputFilePath:String, outPutFilePath:String){

        var imageSize = await sizeOfImage(inputFilePath);
        var imageMaxValue = Math.max(imageSize.height, imageSize.width);
        var imageMinValue = Math.min(imageSize.height, imageSize.width);
        var sharpSize = imageMinValue;
        if (imageMaxValue > GlobalConfig().THUMB_SIZE) {
          sharpSize = GlobalConfig().THUMB_SIZE;
        }

        if(inputFilePath.endsWith(".png")){

            sharp(inputFilePath)
           .toFormat("png")   .resize(sharpSize, sharpSize, {
            fit: sharp.fit.outside,
            withoutReduction: true,
          })
            .toFile(
                outPutFilePath
            );
                    }else{
                        sharp(inputFilePath)
                        .jpeg({ mozjpeg: true })
                        .resize(sharpSize, sharpSize, {
                          fit: sharp.fit.outside,
                          withoutReduction: true,
                        })
                        .toFile(
                            outPutFilePath
                        );
                    }
    }





}

