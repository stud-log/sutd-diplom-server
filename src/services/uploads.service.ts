
class UploadsService {
  //special for ckeditor
  async uploadCKEDITOR(file: Express.Multer.File) {
    try {
  
      return {
        uploaded: true,
        url: `${process.env.THIS_URL}/static/ckeditor/${file.filename}`,
      };
    }
    catch(e) {
      console.log(e);
      throw e;
    }
    
  }
}

export default new UploadsService();
