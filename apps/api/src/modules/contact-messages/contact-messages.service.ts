import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContactStatus } from '@prisma/client';

@Injectable()
export class ContactMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    return this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject || 'رسالة من الموقع',
        message: dto.message,
        status: 'NEW',
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: ContactStatus;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { subject: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.prisma.contactMessage.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: ContactStatus) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  async getStats() {
    const [newCount, readCount, repliedCount, totalCount] = await Promise.all([
      this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
      this.prisma.contactMessage.count({ where: { status: 'READ' } }),
      this.prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
      this.prisma.contactMessage.count(),
    ]);

    return {
      new: newCount,
      read: readCount,
      replied: repliedCount,
      total: totalCount,
    };
  }
}
