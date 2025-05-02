import { EmployeeFields } from '@/entities/employee.entity';
import { LogFields } from '@/entities/log.entity';
import { SpendInfoFields } from '@/entities/spendinfo.entity';

export const dateFieldConfig = {
    WITH_TIME: [
      LogFields.TIME,
      SpendInfoFields.TIME
    ],
    
    WITHOUT_TIME: [
        EmployeeFields.DATEOFBITRH,
        EmployeeFields.HIREDATE
    ]
  };