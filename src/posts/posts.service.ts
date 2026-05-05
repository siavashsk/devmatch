import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}
  async findAll(): Promise<Post[]> {
    return this.postRepository.find();
  }

  async findOne(id: number): Promise<Post> {
    const singlePost = await this.postRepository.findOneBy({ id });

    if (!singlePost) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }

    return singlePost;
  }

  async create(createPostData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    const newPost = this.postRepository.create({
      title: createPostData.title,
      content: createPostData.content,
      authorName: createPostData.authorName,
    });

    return this.postRepository.save(newPost);
  }

  async update(
    id: number,
    updatePostData: Partial<Omit<Post, 'id' | 'createdAt'>>,
  ): Promise<Post> {
    const findPostToUpdate = await this.findOne(id);

    if (updatePostData.title) {
      findPostToUpdate.title = updatePostData.title;
    }
    if (updatePostData.content) {
      findPostToUpdate.content = updatePostData.content;
    }
    if (updatePostData.authorName) {
      findPostToUpdate.authorName = updatePostData.authorName;
    }

    return this.postRepository.save(findPostToUpdate);
  }

  async delete(id: number): Promise<void> {
    const findPostToDelete = await this.findOne(id);

    await this.postRepository.remove(findPostToDelete);
  }
}
