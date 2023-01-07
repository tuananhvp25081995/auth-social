import { EntityRepository, Repository } from 'typeorm';

import { AdminEntity } from '../entities';

@EntityRepository(AdminEntity)
export class AdminRepository extends Repository<AdminEntity> {}
