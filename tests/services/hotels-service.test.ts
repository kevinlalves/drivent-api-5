import { Address, Enrollment, Hotel, Room, Ticket, TicketStatus, TicketType } from '@prisma/client';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsService from '@/services/hotels-service';
import { notFoundError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import { cannotListHotelsError } from '@/errors/cannot-list-hotels-error';
import hotelRepository from '@/repositories/hotel-repository';

describe('module hotelsService', () => {
  describe('function getHotels', () => {
    const subject = () => hotelsService.getHotels(userId);

    const userId = 19;
    let findEnrollmentByUserIdSpy: jest.SpyInstance;

    describe('when there is no enrollment for the user', () => {
      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(null);
      });

      it('calls the function findWithAddressByUserId from enrollmentRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findEnrollmentByUserIdSpy).toBeCalledTimes(1);
        expect(findEnrollmentByUserIdSpy).toBeCalledWith(userId);
      });

      it('rejects to notFoundError', async () => {
        await expect(subject()).rejects.toEqual(notFoundError());
      });
    });

    describe('when the user has a enrollment', () => {
      const enrollmentId = 21;
      let findTicketByEnrollmentIdSpy: jest.SpyInstance;

      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest
          .spyOn(enrollmentRepository, 'findWithAddressByUserId')
          .mockResolvedValue({ id: enrollmentId } as Enrollment & { Address: Address[] });
      });

      it('calls the function findWithAddressByUserId from enrollmentRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findEnrollmentByUserIdSpy).toBeCalledTimes(1);
        expect(findEnrollmentByUserIdSpy).toBeCalledWith(userId);
      });

      describe('when the ticket is invalid', () => {
        beforeEach(() => {
          findTicketByEnrollmentIdSpy = jest
            .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
            .mockResolvedValue(null);
        });

        it('calls the function findTicketByEnrollmentId from ticketsRepository with correct args', async () => {
          try {
            await subject();
          } catch {}

          expect(findTicketByEnrollmentIdSpy).toBeCalledTimes(1);
          expect(findTicketByEnrollmentIdSpy).toBeCalledWith(enrollmentId);
        });

        it('rejects to cannotListHotelsError', async () => {
          await expect(subject()).rejects.toEqual(cannotListHotelsError());
        });
      });

      describe('when the ticket is valid', () => {
        let findHotelsSpy: jest.SpyInstance;

        beforeEach(() => {
          findTicketByEnrollmentIdSpy = jest
            .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
            .mockResolvedValue({ status: TicketStatus.PAID, TicketType: { includesHotel: true } } as Ticket & {
              TicketType: TicketType;
            });
        });

        it('calls the function findTicketByEnrollmentId from ticketsRepository with correct args', async () => {
          try {
            await subject();
          } catch {}

          expect(findTicketByEnrollmentIdSpy).toBeCalledTimes(1);
          expect(findTicketByEnrollmentIdSpy).toBeCalledWith(enrollmentId);
        });

        describe('when there is not hotels', () => {
          beforeEach(() => {
            findHotelsSpy = jest.spyOn(hotelRepository, 'findHotels').mockResolvedValue([]);
          });

          it('calls the function findHotels from hotelRepository', async () => {
            try {
              await subject();
            } catch {}

            expect(findHotelsSpy).toBeCalledTimes(1);
          });

          it('rejects to notFoundError', async () => {
            await expect(subject()).rejects.toEqual(notFoundError());
          });
        });

        describe('when there are hotels', () => {
          const hotelsList = [{ id: 12 }, { id: 65 }] as Hotel[];

          beforeEach(() => {
            findHotelsSpy = jest.spyOn(hotelRepository, 'findHotels').mockResolvedValue(hotelsList);
          });

          it('calls the function findHotels from hotelRepository', async () => {
            await subject();

            expect(findHotelsSpy).toBeCalledTimes(1);
          });

          it('resolves to the correct value', async () => {
            await expect(subject()).resolves.toEqual(hotelsList);
          });
        });
      });
    });
  });

  describe('function getHotelsWithRooms', () => {
    const subject = () => hotelsService.getHotelsWithRooms(userId, hotelId);

    const userId = 18;
    const hotelId = 15;
    let findEnrollmentByUserIdSpy: jest.SpyInstance;

    describe('when there is no enrollment for the user', () => {
      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(null);
      });

      it('calls the function findWithAddressByUserId from enrollmentRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findEnrollmentByUserIdSpy).toBeCalledTimes(1);
        expect(findEnrollmentByUserIdSpy).toBeCalledWith(userId);
      });

      it('rejects to notFoundError', async () => {
        await expect(subject()).rejects.toEqual(notFoundError());
      });
    });

    describe('when the user has a enrollment', () => {
      const enrollmentId = 21;
      let findTicketByEnrollmentIdSpy: jest.SpyInstance;

      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest
          .spyOn(enrollmentRepository, 'findWithAddressByUserId')
          .mockResolvedValue({ id: enrollmentId } as Enrollment & { Address: Address[] });
      });

      it('calls the function findWithAddressByUserId from enrollmentRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findEnrollmentByUserIdSpy).toBeCalledTimes(1);
        expect(findEnrollmentByUserIdSpy).toBeCalledWith(userId);
      });

      describe('when the ticket is invalid', () => {
        beforeEach(() => {
          findTicketByEnrollmentIdSpy = jest
            .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
            .mockResolvedValue(null);
        });

        it('calls the function findTicketByEnrollmentId from ticketsRepository with correct args', async () => {
          try {
            await subject();
          } catch {}

          expect(findTicketByEnrollmentIdSpy).toBeCalledTimes(1);
          expect(findTicketByEnrollmentIdSpy).toBeCalledWith(enrollmentId);
        });

        it('rejects to cannotListHotelsError', async () => {
          await expect(subject()).rejects.toEqual(cannotListHotelsError());
        });
      });

      describe('when the ticket is valid', () => {
        let findRoomsByHotelIdSpy: jest.SpyInstance;

        beforeEach(() => {
          findTicketByEnrollmentIdSpy = jest
            .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
            .mockResolvedValue({ status: TicketStatus.PAID, TicketType: { includesHotel: true } } as Ticket & {
              TicketType: TicketType;
            });
        });

        it('calls the function findTicketByEnrollmentId from ticketsRepository with correct args', async () => {
          try {
            await subject();
          } catch {}

          expect(findTicketByEnrollmentIdSpy).toBeCalledTimes(1);
          expect(findTicketByEnrollmentIdSpy).toBeCalledWith(enrollmentId);
        });

        describe('when there is no hotel with rooms', () => {
          beforeEach(() => {
            findRoomsByHotelIdSpy = jest.spyOn(hotelRepository, 'findRoomsByHotelId').mockResolvedValue(null);
          });

          it('calls the function findRoomsByHotelId with correct args', async () => {
            try {
              await subject();
            } catch {}

            expect(findRoomsByHotelIdSpy).toBeCalledTimes(1);
            expect(findRoomsByHotelIdSpy).toBeCalledWith(hotelId);
          });

          it('rejects to notFoundError', async () => {
            await expect(subject()).rejects.toEqual(notFoundError());
          });
        });

        describe('when there are hotels with rooms', () => {
          beforeEach(() => {
            findRoomsByHotelIdSpy = jest
              .spyOn(hotelRepository, 'findRoomsByHotelId')
              .mockResolvedValue({ Rooms: [{ id: 10 }] } as Hotel & { Rooms: Room[] });
          });

          it('calls the function findRoomsByHotelId with correct args', async () => {
            await subject();

            expect(findRoomsByHotelIdSpy).toBeCalledTimes(1);
            expect(findRoomsByHotelIdSpy).toBeCalledWith(hotelId);
          });

          it('resolves to the correct value', async () => {
            await expect(subject()).resolves.toEqual({ Rooms: [{ id: 10 }] });
          });
        });
      });
    });
  });
});
