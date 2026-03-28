import { jobFormSchema } from './src/routes/employer/-schemas/jobFormSchema';

const form = {
  title: '123123',
  description: 'avcasdasdwasdawdsaadasdawd',
  category: 'Sự kiện',
  salary: '123.123',
  payType: 'Theo giờ',
  address: '123123',
  latitude: 21.0,
  longitude: 105.0,
  shifts: [
    {
      id: 'shift-1',
      name: '12',
      startTime: '08:00',
      endTime: '17:00',
      quantity: 2
    }
  ],
  vacancies: 2,
  gender: 'Cả hai',
  startDate: '2026-03-26',
  deadline: '',
  requirements: [],
  coverImage: null,
  isPremium: false
};

const result = jobFormSchema.safeParse(form);
if (!result.success) {
  console.error("ZOD FAILED:");
  console.error(result.error.flatten().fieldErrors);
} else {
  console.log("ZOD PASSED!");
}
