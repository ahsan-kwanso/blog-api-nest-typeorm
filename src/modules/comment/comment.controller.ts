import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from 'src/database/models/comment.model';
import { Request } from 'express';
import { CommentData, CommentsResult } from 'src/types/comment';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ): Promise<Comment> {
    const userId = req.user.id; // Extract UserId from JWT token
    return this.commentService.create(createCommentDto, userId);
  }

  @Get()
  async findAll(): Promise<Comment[]> {
    return this.commentService.findAll();
  }

  @Get('/post/:id')
  async findCommentsOnPost(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentsResult> {
    return this.commentService.findAllByPostId(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: Request,
  ): Promise<Comment> {
    const userId = req.user.id; // Extract UserId from JWT token
    return this.commentService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<void> {
    const userId = req.user.id; // Extract UserId from JWT token
    return this.commentService.remove(id, userId);
  }
}
