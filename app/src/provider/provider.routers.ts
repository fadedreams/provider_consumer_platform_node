
import { Router, Response, Request, NextFunction } from "express";
import { BadRequestError, uploadDir, Uploader, UploaderMiddlewareOptions, requireAuth, CustomError } from "@fadedreams7pcplatform/common";
import { providerService } from './provider.service'


const uploader = new Uploader(uploadDir)
const middlewareOptions: UploaderMiddlewareOptions = {
  types: ['image/png', 'image/jpeg'],
  fieldName: 'image'
}

const multipeFilesMiddleware = uploader.uploadMultipleFiles(middlewareOptions);

const router = Router()

router.post('/item/new', requireAuth, multipeFilesMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  const { title, price } = req.body;

  if (!req.files) return next(new BadRequestError('images are required'))

  if (req.uploaderError) return next(new BadRequestError(req.uploaderError.message));

  const item = await providerService.addItem({
    title,
    price,
    userId: req.currentUser!.userId,
    files: req.files
  })

  res.status(201).send(item)
})



export { router as providerRouters }
