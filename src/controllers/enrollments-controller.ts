import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import enrollmentsService from '@/services/enrollments-service';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  try {
    const { cep } = req.query;
    await enrollmentsService.createOrUpdateEnrollmentWithAddress(
      {
        ...req.body,
        userId: req.userId,
      },
      cep as string,
    );

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  try {
    const { cep } = req.query;

    const address = await enrollmentsService.getAddressFromCEP(cep as string);

    const result = {
      logradouro: address.logradouro,
      complemento: address.complemento,
      bairro: address.bairro,
      cidade: address.localidade,
      uf: address.uf,
    };
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.send(httpStatus.NO_CONTENT);
    }
    if (error.name === 'InvalidCepError') {
      // return res.send(httpStatus.BAD_REQUEST);
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}
