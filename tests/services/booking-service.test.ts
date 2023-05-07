import { Address, Booking, Enrollment, Room, Ticket, TicketType } from '@prisma/client';
import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';
import roomRepository from '@/repositories/room-repository';
import { cannotBookingError } from '@/errors/cannot-booking-error';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import { badRequestError } from '@/errors/bad-request-error';

describe('module bookingService', () => {
  describe('function bookingRoomById', () => {
    const subject = () => bookingService.bookingRoomById(userId, roomId);

    const userId = 35;
    let roomId: null | number;

    describe('when roomId is invalid', () => {
      beforeEach(() => {
        roomId = null;
      });

      it('rejects to badRequestError', async () => {
        await expect(subject()).rejects.toEqual(badRequestError());
      });
    });

    describe('when roomId is valid', () => {
      let checkEnrollmentTicketSpy: jest.SpyInstance;

      beforeEach(() => {
        roomId = 40;
      });

      describe('when the function checkEnrollmentTicket rejects its promise', () => {
        beforeEach(() => {
          checkEnrollmentTicketSpy = jest
            .spyOn(bookingService, 'checkEnrollmentTicket')
            .mockRejectedValue({ error: '1' });
        });

        it('calls the function checkEnrollmentTicket', async () => {
          try {
            await subject();
          } catch {}

          expect(checkEnrollmentTicketSpy).toBeCalledTimes(1);
          expect(checkEnrollmentTicketSpy).toBeCalledWith(userId);
        });

        it('rejects to the value of checkEnrollmentTicket error', async () => {
          await expect(subject()).rejects.toEqual({ error: '1' });
        });
      });

      describe('when the function checkEnrollmentTicket resolves its promise', () => {
        let checkValidBookingSpy: jest.SpyInstance;

        beforeEach(() => {
          checkEnrollmentTicketSpy = jest.spyOn(bookingService, 'checkEnrollmentTicket').mockResolvedValue(null);
        });

        it('calls the function checkEnrollmentTicket', async () => {
          try {
            await subject();
          } catch {}

          expect(checkEnrollmentTicketSpy).toBeCalledTimes(1);
          expect(checkEnrollmentTicketSpy).toBeCalledWith(userId);
        });

        describe('when the function checkValidBooking rejects its promise', () => {
          beforeEach(() => {
            checkValidBookingSpy = jest.spyOn(bookingService, 'checkValidBooking').mockRejectedValue({ error: '2' });
          });

          it('calls the function checkValidBooking from bookingService with correct args', async () => {
            try {
              await subject();
            } catch {}

            expect(checkValidBookingSpy).toBeCalledTimes(1);
            expect(checkValidBookingSpy).toBeCalledWith(roomId);
          });

          it('rejects to the value of checkValidBooking error', async () => {
            await expect(subject()).rejects.toEqual({ error: '2' });
          });
        });

        describe('when the function checkValidBooking resolves its promise', () => {
          const booking = { userId } as Booking;
          let createBookingSpy: jest.SpyInstance;

          beforeEach(() => {
            checkValidBookingSpy = jest.spyOn(bookingService, 'checkValidBooking').mockResolvedValue(null);
            createBookingSpy = jest.spyOn(bookingRepository, 'create').mockResolvedValue(booking);
          });

          it('calls the function checkValidBooking from bookingService with correct args', async () => {
            await subject();

            expect(checkValidBookingSpy).toBeCalledTimes(1);
            expect(checkValidBookingSpy).toBeCalledWith(roomId);
          });

          it('calls the function create from bookingRepository with correct args', async () => {
            await subject();

            expect(createBookingSpy).toBeCalledTimes(1);
            expect(createBookingSpy).toBeCalledWith({ roomId, userId });
          });

          it('resolves to the correct value', async () => {
            await expect(subject()).resolves.toEqual(booking);
          });
        });
      });
    });
  });

  describe('function getBooking', () => {
    const subject = () => bookingService.getBooking(userId);

    const userId = 27;
    let findBookingByUserIdSpy: jest.SpyInstance;

    describe('when the user has no bookings', () => {
      beforeEach(() => {
        findBookingByUserIdSpy = jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValue(null);
      });

      it('calls the function findUserById from bookingRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findBookingByUserIdSpy).toBeCalledTimes(1);
        expect(findBookingByUserIdSpy).toBeCalledWith(userId);
      });

      it('rejects to notFoundError', async () => {
        await expect(subject()).rejects.toEqual(notFoundError());
      });
    });

    describe('when the user has a booking', () => {
      const booking = { userId } as Booking & { Room: Room };

      beforeEach(() => {
        findBookingByUserIdSpy = jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValue(booking);
      });

      it('calls the function findUserById from bookingRepository with correct args', async () => {
        await subject();

        expect(findBookingByUserIdSpy).toBeCalledTimes(1);
        expect(findBookingByUserIdSpy).toBeCalledWith(userId);
      });

      it('resolves to the correct value', async () => {
        await expect(subject()).resolves.toEqual(booking);
      });
    });
  });

  describe('function changeBookingRoomById', () => {
    const subject = () => bookingService.changeBookingRoomById(userId, roomId);

    const userId = 34;
    let roomId: null | number;

    describe('when roomId is invalid', () => {
      beforeEach(() => {
        roomId = null;
      });

      it('rejects to badRequestError', async () => {
        await expect(subject()).rejects.toEqual(badRequestError());
      });
    });

    describe('when roomId is valid', () => {
      let checkValidBookingSpy: jest.SpyInstance;

      beforeEach(() => {
        roomId = 10;
      });

      describe('when checkValidBooking rejects the promise', () => {
        beforeEach(() => {
          checkValidBookingSpy = jest.spyOn(bookingService, 'checkValidBooking').mockRejectedValue({ error: 'error' });
        });

        it('calls the function checkValidBooking', async () => {
          try {
            await subject();
          } catch {}

          expect(checkValidBookingSpy).toBeCalledTimes(1);
          expect(checkValidBookingSpy).toBeCalledWith(roomId);
        });

        it('rejects to the value of checkValidBooking error', async () => {
          await expect(subject()).rejects.toEqual({ error: 'error' });
        });
      });

      describe('when checkValidBooking resolves the promise', () => {
        let findBookingByUserIdSpy: jest.SpyInstance;

        beforeEach(() => {
          checkValidBookingSpy = jest.spyOn(bookingService, 'checkValidBooking').mockResolvedValue(null);
        });

        it('calls the function checkValidBooking', async () => {
          try {
            await subject();
          } catch {}

          expect(checkValidBookingSpy).toBeCalledTimes(1);
          expect(checkValidBookingSpy).toBeCalledWith(roomId);
        });

        describe('when the booking is invalid', () => {
          beforeEach(() => {
            findBookingByUserIdSpy = jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValue(null);
          });

          it('calls the function findByUserId from bookingRepository with correct args', async () => {
            try {
              await subject();
            } catch {}

            expect(findBookingByUserIdSpy).toBeCalledTimes(1);
            expect(findBookingByUserIdSpy).toBeCalledWith(userId);
          });

          it('rejects to cannotBookingError', async () => {
            await expect(subject).rejects.toEqual(cannotBookingError());
          });
        });

        describe('when the booking is valid', () => {
          const booking = { roomId } as Booking;
          const bookingId = 20;
          let upsertBookingSpy: jest.SpyInstance;

          beforeEach(() => {
            findBookingByUserIdSpy = jest
              .spyOn(bookingRepository, 'findByUserId')
              .mockResolvedValue({ id: bookingId, userId } as Booking & { Room: Room });

            upsertBookingSpy = jest.spyOn(bookingRepository, 'upsertBooking').mockResolvedValue(booking);
          });

          it('calls the function findByUserId from bookingRepository with correct args', async () => {
            await subject();

            expect(findBookingByUserIdSpy).toBeCalledTimes(1);
            expect(findBookingByUserIdSpy).toBeCalledWith(userId);
          });

          it('calls the function upsertBooking from bookingRepository with correct args', async () => {
            await subject();

            expect(upsertBookingSpy).toBeCalledTimes(1);
            expect(upsertBookingSpy).toBeCalledWith({
              id: bookingId,
              roomId,
              userId,
            });
          });

          it('resolves to the correct value', async () => {
            await expect(subject()).resolves.toEqual(booking);
          });
        });
      });
    });
  });

  describe('function checkEnrollmentTicket', () => {
    const subject = () => bookingService.checkEnrollmentTicket(userId);

    const userId = 3;
    let findEnrollmentByUserId: jest.SpyInstance;

    describe('when the user has no enrollments', () => {
      beforeEach(() => {
        findEnrollmentByUserId = jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(null);
      });

      it('calls the function findWithAddressByUserId from enrollmentRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findEnrollmentByUserId).toBeCalledTimes(1);
        expect(findEnrollmentByUserId).toBeCalledWith(userId);
      });

      it('rejects to cannotBookingError', async () => {
        await expect(subject()).rejects.toEqual(cannotBookingError());
      });
    });

    describe('when the user has a enrollment', () => {
      const enrollmentId = 35;
      let findTicketByEnrollmentIdSpy: jest.SpyInstance;

      beforeEach(() => {
        findEnrollmentByUserId = jest
          .spyOn(enrollmentRepository, 'findWithAddressByUserId')
          .mockResolvedValue({ id: enrollmentId } as Enrollment & { Address: Address[] });
      });

      it('calls the function findWithAddressByUserId from enrollmentRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findEnrollmentByUserId).toBeCalledTimes(1);
        expect(findEnrollmentByUserId).toBeCalledWith(userId);
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

        it('rejects to cannotBookingError', async () => {
          await expect(subject()).rejects.toEqual(cannotBookingError());
        });
      });

      describe('when the ticket is valid', () => {
        beforeEach(() => {
          findTicketByEnrollmentIdSpy = jest
            .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
            .mockResolvedValue({ status: 'PAID', TicketType: { includesHotel: true } } as Ticket & {
              TicketType: TicketType;
            });
        });

        it('calls the function findTicketByEnrollmentId from ticketsRepository with correct args', async () => {
          await subject();

          expect(findTicketByEnrollmentIdSpy).toBeCalledTimes(1);
          expect(findTicketByEnrollmentIdSpy).toBeCalledWith(enrollmentId);
        });
      });
    });
  });

  describe('function checkValidBooking', () => {
    const subject = () => bookingService.checkValidBooking(roomId);

    const roomId = 93;
    let findRoomByIdSpy: jest.SpyInstance;

    describe('when the room does not exist', () => {
      beforeEach(() => {
        findRoomByIdSpy = jest.spyOn(roomRepository, 'findById').mockResolvedValue(null);
      });

      it('calls the function findById from roomRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findRoomByIdSpy).toBeCalledTimes(1);
        expect(findRoomByIdSpy).toBeCalledWith(roomId);
      });

      it('rejects to notFoundError', async () => {
        await expect(subject()).rejects.toEqual(notFoundError());
      });
    });

    describe('when the room exists', () => {
      const capacity = 3;
      let findBookingsByRoomIdSpy: jest.SpyInstance;

      beforeEach(() => {
        findRoomByIdSpy = jest.spyOn(roomRepository, 'findById').mockResolvedValue({ capacity } as Room);
      });

      it('calls the function findById from roomRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findRoomByIdSpy).toBeCalledTimes(1);
        expect(findRoomByIdSpy).toBeCalledWith(roomId);
      });

      describe('when the number of bookings for the room is smaller than its capacity', () => {
        beforeEach(() => {
          findBookingsByRoomIdSpy = jest
            .spyOn(bookingRepository, 'findByRoomId')
            .mockResolvedValue([{ Room: {} }] as Array<Booking & { Room: Room }>);
        });

        it('calls the function findByRoomId from bookingRepository with correct args', async () => {
          await subject();

          expect(findBookingsByRoomIdSpy).toBeCalledTimes(1);
          expect(findBookingsByRoomIdSpy).toBeCalledWith(roomId);
        });
      });

      describe('when the number of bookings for the room is equal to its capacity', () => {
        beforeEach(() => {
          findBookingsByRoomIdSpy = jest
            .spyOn(bookingRepository, 'findByRoomId')
            .mockResolvedValue([{ Room: {} }, { Room: {} }, { Room: {} }] as Array<Booking & { Room: Room }>);
        });

        it('calls the function findByRoomId from bookingRepository with correct args', async () => {
          try {
            await subject();
          } catch {}

          expect(findBookingsByRoomIdSpy).toBeCalledTimes(1);
          expect(findBookingsByRoomIdSpy).toBeCalledWith(roomId);
        });

        it('rejects to cannotBookingError', async () => {
          await expect(subject()).rejects.toEqual(cannotBookingError());
        });
      });
    });
  });
});
