
import { ItemModel, uploadDir } from "@fadedreams7pcplatform/common";
import { Item } from "./item.model";
import { CreateItemDto, UpdateItemDto, DeleteItemDto, AddImagesDto, DeleteImagesDto } from '../dtos/item.dto'
import fs from 'fs'
import path from 'path'

export class ItemService {
  constructor(public itemModel: ItemModel) { }

  async getOneById(itemId: string) {
    return await this.itemModel.findById(itemId)
  }

  async create(createItemDto: CreateItemDto) {
    const images = this.generateItemImages(createItemDto.files);
    const item = new this.itemModel({
      title: createItemDto.title,
      price: createItemDto.price,
      user: createItemDto.userId,
      images: images
    })

    return await item.save()
  }

  async updateItem(updateItemDto: UpdateItemDto) {
    return await this.itemModel.findOneAndUpdate({ _id: updateItemDto.itemId },
      { $set: { title: updateItemDto.title, price: updateItemDto.price } }, { new: true })
  }

  //async deleteItem(deleteItemDto: DeleteItemDto) {
  //return await this.itemModel.findOneAndRemove({ _id: deleteItemDto.itemId })
  //}

  async addImages(addImagesDto: AddImagesDto) {
    const images = this.generateItemImages(addImagesDto.files);
    return await this.itemModel.findOneAndUpdate({ _id: addImagesDto.itemId },
      { $push: { images: { $each: images } } }, { new: true })
  }

  async deleteImages(deleteImagesDto: DeleteImagesDto) {
    return await this.itemModel.findOneAndUpdate({ _id: deleteImagesDto.itemId },
      { $pull: { images: { _id: { $in: deleteImagesDto.imagesIds } } } }, { new: true })
  }

  generateBase64Url(contentType: string, buffer: Buffer) {
    return `data:${contentType};base64,${buffer.toString('base64')}`
  }

  generateItemImages(files: CreateItemDto['files']): Array<{ src: string }> {
    let images: Array<Express.Multer.File>;

    if (typeof files === "object") {
      images = Object.values(files).flat()
    } else {
      images = files ? [...files] : []
    }

    return images.map((file: Express.Multer.File) => {
      let srcObj = { src: this.generateBase64Url(file.mimetype, fs.readFileSync(path.join(uploadDir + file.filename))) }
      fs.unlink(path.join(uploadDir + file.filename), () => { })
      return srcObj
    })
  }
}

export const itemService = new ItemService(Item)
