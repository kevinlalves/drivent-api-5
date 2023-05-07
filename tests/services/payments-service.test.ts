import { Enrollment, Payment, Ticket, TicketType } from '@prisma/client';
import { notFoundError, unauthorizedError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import paymentsRepository from '@/repositories/payments-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import paymentsService from '@/services/payments-service';

describe('module paymentsService', () => {
  describe('function getPaymentByTicketId', () => {
    const subject = () => paymentsService.getPaymentByTicketId(userId, ticketId);

    let findTicketByIdSpy: jest.SpyInstance;
    const userId = 10;
    const ticketId = 20;

    describe('when there is no ticket with the given id', () => {
      beforeEach(() => {
        findTicketByIdSpy = jest.spyOn(ticketsRepository, 'findTickeyById').mockResolvedValue(null);
      });

      it('calls the function findTickeyById from ticketsRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findTicketByIdSpy).toBeCalledTimes(1);
        expect(findTicketByIdSpy).toBeCalledWith(ticketId);
      });

      it('rejects to notFoundError', async () => {
        await expect(subject()).rejects.toEqual(notFoundError());
      });
    });

    describe('when there is a ticket with the given id', () => {
      const enrollmentId = 30;
      let findEnrollmentByIdSpy: jest.SpyInstance;

      beforeEach(() => {
        findTicketByIdSpy = jest
          .spyOn(ticketsRepository, 'findTickeyById')
          .mockResolvedValue({ enrollmentId } as Ticket & { Enrollment: Enrollment });
      });

      it('calls the function findTickeyById from ticketsRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findTicketByIdSpy).toBeCalledTimes(1);
        expect(findTicketByIdSpy).toBeCalledWith(ticketId);
      });

      describe('when there is no enrollment with the given id', () => {
        beforeEach(() => {
          findEnrollmentByIdSpy = jest.spyOn(enrollmentRepository, 'findById').mockResolvedValue(null);
        });

        it('calls the function findById from enrollmentRepository with correct args', async () => {
          try {
            await subject();
          } catch {}

          expect(findEnrollmentByIdSpy).toBeCalledTimes(1);
          expect(findEnrollmentByIdSpy).toBeCalledWith(enrollmentId);
        });

        it('rejects to notFoundError', async () => {
          await expect(subject()).rejects.toEqual(notFoundError());
        });
      });

      describe('when there is a enrollment with the given id', () => {
        describe('when the enrollment does not belong to the user', () => {
          beforeEach(() => {
            findEnrollmentByIdSpy = jest
              .spyOn(enrollmentRepository, 'findById')
              .mockResolvedValue({ userId: userId + 1 } as Enrollment);
          });

          it('calls the function findById from enrollmentRepository with correct args', async () => {
            try {
              await subject();
            } catch {}

            expect(findEnrollmentByIdSpy).toBeCalledTimes(1);
            expect(findEnrollmentByIdSpy).toBeCalledWith(enrollmentId);
          });

          it('rejects to unauthorizedError', async () => {
            await expect(subject()).rejects.toEqual(unauthorizedError());
          });
        });

        describe('when the enrollment belongs to the user', () => {
          let findPaymentByTicketIdSpy: jest.SpyInstance;

          beforeEach(() => {
            findEnrollmentByIdSpy = jest
              .spyOn(enrollmentRepository, 'findById')
              .mockResolvedValue({ userId } as Enrollment);
          });

          it('calls the function findById from enrollmentRepository with correct args', async () => {
            try {
              await subject();
            } catch {}

            expect(findEnrollmentByIdSpy).toBeCalledTimes(1);
            expect(findEnrollmentByIdSpy).toBeCalledWith(enrollmentId);
          });

          describe('when there is a payment for the given ticket', () => {
            beforeEach(() => {
              findPaymentByTicketIdSpy = jest
                .spyOn(paymentsRepository, 'findPaymentByTicketId')
                .mockResolvedValue(null);
            });

            it('calls the fuction findPaymentByTicketId from paymentsRepository with correct args', async () => {
              try {
                await subject();
              } catch {}

              expect(findPaymentByTicketIdSpy).toBeCalledTimes(1);
              expect(findPaymentByTicketIdSpy).toBeCalledWith(ticketId);
            });

            it('rejects to notFoundError', async () => {
              await expect(subject()).rejects.toEqual(notFoundError());
            });
          });

          describe('when there is no payments for the given ticket', () => {
            beforeEach(() => {
              findPaymentByTicketIdSpy = jest
                .spyOn(paymentsRepository, 'findPaymentByTicketId')
                .mockResolvedValue({ cardIssuer: 'ok' } as Payment);
            });

            it('calls the fuction findPaymentByTicketId from paymentsRepository with correct args', async () => {
              try {
                await subject();
              } catch {}

              expect(findPaymentByTicketIdSpy).toBeCalledTimes(1);
              expect(findPaymentByTicketIdSpy).toBeCalledWith(ticketId);
            });

            it('resolves to the correct value', async () => {
              await expect(subject()).resolves.toEqual({ cardIssuer: 'ok' });
            });
          });
        });
      });
    });
  });

  describe('function paymentProcess', () => {
    const subject = () => paymentsService.paymentProcess(ticketId, userId, cardData);

    let findTicketByIdSpy: jest.SpyInstance;
    const ticketId = 10;
    const userId = 20;
    const cardData = {
      issuer: 'test-issuer',
      number: 1232323,
      name: 'test',
      expirationDate: new Date(),
      cvv: 124,
    };

    describe('when there is no ticket with the given id', () => {
      beforeEach(() => {
        findTicketByIdSpy = jest.spyOn(ticketsRepository, 'findTickeyById').mockResolvedValue(null);
      });

      it('calls the function findTickeyById from ticketsRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findTicketByIdSpy).toBeCalledTimes(1);
        expect(findTicketByIdSpy).toBeCalledWith(ticketId);
      });

      it('rejects to notFoundError', async () => {
        await expect(subject()).rejects.toEqual(notFoundError());
      });
    });

    describe('when there is a ticket with the given id', () => {
      const enrollmentId = 30;
      let findEnrollmentByIdSpy: jest.SpyInstance;

      beforeEach(() => {
        findTicketByIdSpy = jest
          .spyOn(ticketsRepository, 'findTickeyById')
          .mockResolvedValue({ enrollmentId } as Ticket & { Enrollment: Enrollment });
      });

      it('calls the function findTickeyById from ticketsRepository with correct args', async () => {
        try {
          await subject();
        } catch {}

        expect(findTicketByIdSpy).toBeCalledTimes(1);
        expect(findTicketByIdSpy).toBeCalledWith(ticketId);
      });

      describe('when there is no enrollment with the given id', () => {
        beforeEach(() => {
          findEnrollmentByIdSpy = jest.spyOn(enrollmentRepository, 'findById').mockResolvedValue(null);
        });

        it('calls the function findById from enrollmentRepository with correct args', async () => {
          try {
            await subject();
          } catch {}

          expect(findEnrollmentByIdSpy).toBeCalledTimes(1);
          expect(findEnrollmentByIdSpy).toBeCalledWith(enrollmentId);
        });

        it('rejects to notFoundError', async () => {
          await expect(subject()).rejects.toEqual(notFoundError());
        });
      });

      describe('when there is a enrollment with the given id', () => {
        describe('when the enrollment does not belong to the user', () => {
          beforeEach(() => {
            findEnrollmentByIdSpy = jest
              .spyOn(enrollmentRepository, 'findById')
              .mockResolvedValue({ userId: userId + 1 } as Enrollment);
          });

          it('calls the function findById from enrollmentRepository with correct args', async () => {
            try {
              await subject();
            } catch {}

            expect(findEnrollmentByIdSpy).toBeCalledTimes(1);
            expect(findEnrollmentByIdSpy).toBeCalledWith(enrollmentId);
          });

          it('rejects to unauthorizedError', async () => {
            await expect(subject()).rejects.toEqual(unauthorizedError());
          });
        });

        describe('when the enrollment belongs to the user', () => {
          const price = 1000;
          const paymentData = {
            ticketId,
            value: price,
            cardIssuer: cardData.issuer,
            cardLastDigits: cardData.number.toString().slice(-4),
          };
          let findTicketWithTypeByIdSpy: jest.SpyInstance;
          let createPaymentSpy: jest.SpyInstance;
          let ticketProcessPaymentSpy: jest.SpyInstance;

          beforeEach(() => {
            findEnrollmentByIdSpy = jest
              .spyOn(enrollmentRepository, 'findById')
              .mockResolvedValue({ userId } as Enrollment);

            findTicketWithTypeByIdSpy = jest
              .spyOn(ticketsRepository, 'findTickeWithTypeById')
              .mockResolvedValue({ TicketType: { price } } as Ticket & { TicketType: TicketType });

            createPaymentSpy = jest
              .spyOn(paymentsRepository, 'createPayment')
              .mockResolvedValue({ cardIssuer: 'ok' } as Payment);

            ticketProcessPaymentSpy = jest.spyOn(ticketsRepository, 'ticketProcessPayment').mockResolvedValue(null);
          });

          it('calls the function findById from enrollmentRepository with correct args', async () => {
            await subject();

            expect(findEnrollmentByIdSpy).toBeCalledTimes(1);
            expect(findEnrollmentByIdSpy).toBeCalledWith(enrollmentId);
          });

          it('calls the function findTickeWithTypeId from ticketsRepository with correct args', async () => {
            await subject();

            expect(findTicketWithTypeByIdSpy).toBeCalledTimes(1);
            expect(findTicketWithTypeByIdSpy).toBeCalledWith(ticketId);
          });

          it('calls the function createPayment from paymentsRepository with correct args', async () => {
            await subject();

            expect(createPaymentSpy).toBeCalledTimes(1);
            expect(createPaymentSpy).toBeCalledWith(ticketId, paymentData);
          });

          it('calls the function ticketProcessPayment from ticketsRepository with correct args', async () => {
            await subject();

            expect(ticketProcessPaymentSpy).toBeCalledTimes(1);
            expect(ticketProcessPaymentSpy).toBeCalledWith(ticketId);
          });

          it('resolves to the correct value', async () => {
            await expect(subject()).resolves.toEqual({ cardIssuer: 'ok' });
          });
        });
      });
    });
  });
});
