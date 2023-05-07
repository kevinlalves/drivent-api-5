import { Address, Enrollment, Ticket, TicketStatus, TicketType } from '@prisma/client';
import ticketsRepository from '@/repositories/tickets-repository';
import ticketService from '@/services/tickets-service';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError } from '@/errors';

describe('module ticketService', () => {
  describe('function getTicketType', () => {
    const subject = () => ticketService.getTicketType();

    let findTicketTypesSpy: jest.SpyInstance;

    beforeEach(() => {
      findTicketTypesSpy = jest
        .spyOn(ticketsRepository, 'findTicketTypes')
        .mockResolvedValue([{ name: 'ok' } as TicketType]);
    });

    it('calls the function findTicketTypes from ticketsRepository', async () => {
      await subject();

      expect(findTicketTypesSpy).toBeCalledTimes(1);
    });

    it('resolve to the correct value', async () => {
      await expect(subject()).resolves.toEqual([{ name: 'ok' }]);
    });
  });

  describe('function getTicketByUserId', () => {
    const subject = () => ticketService.getTicketByUserId(userId);

    const userId = 34;
    let findEnrollmentByUserIdSpy: jest.SpyInstance;

    describe('when there is no enrollment for the user', () => {
      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(null);
      });

      it('calls the function findWithAddressByUserId with correct args', async () => {
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
      const id = 47;
      let findTicketByEnrollmentIdSpy: jest.SpyInstance;

      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest
          .spyOn(enrollmentRepository, 'findWithAddressByUserId')
          .mockResolvedValue({ id } as Enrollment & { Address: Address[] });
      });

      it('calls the function findWithAddressByUserId with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findEnrollmentByUserIdSpy).toBeCalledTimes(1);
        expect(findEnrollmentByUserIdSpy).toBeCalledWith(userId);
      });

      describe('when the enrollment has no tickets', () => {
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
          expect(findTicketByEnrollmentIdSpy).toBeCalledWith(id);
        });

        it('rejects to notFoundError', async () => {
          await expect(subject()).rejects.toEqual(notFoundError());
        });
      });

      describe('when the enrollment has any tickets', () => {
        beforeEach(() => {
          findTicketByEnrollmentIdSpy = jest
            .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
            .mockResolvedValue({ enrollmentId: id } as Ticket & { TicketType: TicketType });
        });

        it('calls the function findTicketByEnrollmentId from ticketsRepository with correct args', async () => {
          await subject();

          expect(findTicketByEnrollmentIdSpy).toBeCalledTimes(1);
          expect(findTicketByEnrollmentIdSpy).toBeCalledWith(id);
        });

        it('resolves to the correct value', async () => {
          await expect(subject()).resolves.toEqual({ enrollmentId: id });
        });
      });
    });
  });

  describe('function createTicket', () => {
    const subject = () => ticketService.createTicket(userId, ticketTypeId);

    const userId = 29;
    const ticketTypeId = 77;
    let findEnrollmentByUserIdSpy: jest.SpyInstance;

    describe('when there is no enrollment for the user', () => {
      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(null);
      });

      it('calls the function findWithAddressByUserId with correct args', async () => {
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

    describe('when the user have a enrollment', () => {
      const id = 47;
      const ticketData = {
        ticketTypeId,
        enrollmentId: id,
        status: TicketStatus.RESERVED,
      };
      let createTicketSpy: jest.SpyInstance;

      beforeEach(() => {
        findEnrollmentByUserIdSpy = jest
          .spyOn(enrollmentRepository, 'findWithAddressByUserId')
          .mockResolvedValue({ id } as Enrollment & { Address: Address[] });

        createTicketSpy = jest
          .spyOn(ticketsRepository, 'createTicket')
          .mockResolvedValue({ enrollmentId: id } as Ticket & { TicketType: TicketType });
      });

      it('calls the function findWithAddressByUserId with correct args', async () => {
        await subject();

        expect(findEnrollmentByUserIdSpy).toBeCalledTimes(1);
        expect(findEnrollmentByUserIdSpy).toBeCalledWith(userId);
      });

      it('calls the function createTicket from ticketsRepository with correct args', async () => {
        await subject();

        expect(createTicketSpy).toBeCalledTimes(1);
        expect(createTicketSpy).toBeCalledWith(ticketData);
      });

      it('resolves to the correct value', async () => {
        await expect(subject()).resolves.toEqual({ enrollmentId: id });
      });
    });
  });
});
