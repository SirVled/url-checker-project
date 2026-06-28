import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CreateJobDto } from './create-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto) {
    const job = this.jobsService.create(dto.urls);
    return { jobId: job.id };
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const job = this.jobsService.findOne(id);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    const job = this.jobsService.cancel(id);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}
