import { Domain, Utils, Logics, DBModels, Types, objHasProp } from '@ikomida/shared-backend';

export default class Terms {
  logger;
  limit = 10;

  constructor(logger: Utils.Logger) {
    this.logger = logger;
  }

  async getTerms(timestamp = 0) {
    try {
      const where =
        timestamp && timestamp != 0 && Number(Logics.Finances.toNumber(timestamp)) == timestamp
          ? {
            createdAt: {
              [Domain.SqlDB.Op.lt]: new Date(Number(Logics.Finances.toNumber(timestamp))),
            },
          }
          : {};
      const termModels = await DBModels.TermModel.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: this.limit,
      });
      const terms = termModels.map((termModel) => {
        return Types.Classes.CTerm.init(
          termModel.name ?? '',
          termModel.text ?? '',
          termModel.type ?? Types.Types.TTerm.PRIVACY_POLICY,
          termModel.active,
          termModel.createdAt,
          termModel.id,
          termModel.createdAt.getTime(),
        );
      });
      return new Utils.Return(
        true,
        terms?.sort((item1, item2) => (item2.timestamp ?? 0) - (item1.timestamp ?? 0)),
      );
    } catch (exception: any) {
      const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_SETTINGS_EXCEPTION, exception?.message);
      return error.logAndReturn(this.logger);
    }
  }

  async newTerm(input: any) {
    try {
      const object: Types.Classes.CTerm = Types.Classes.CTerm.fromObject(input);
      if (!this.validateObject(object)) {
        const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_SETTING_MISSING_DATA);
        return error.logAndReturn(this.logger);
      }
      await DBModels.TermModel.create({
        name: object?.name,
        text: object?.text,
        type: object?.type,
        active: object?.active,
      });
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_SETTING_EXCEPTION, exception?.message);
      return error.logAndReturn(this.logger);
    }
  }

  async removeTerm(id: string) {
    try {
      //TODO: Validate uuid id
      const term = await DBModels.TermModel.findOne({
        where: {
          id: id,
        },
      });
      await term?.destroy();
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_DELETE_SETTING_EXCEPTION, exception?.message);
      return error.logAndReturn(this.logger);
    }
  }

  async editTerm(input: any) {
    try {
      const object: Types.Classes.CTerm = Types.Classes.CTerm.fromObject(input);
      const term = await DBModels.TermModel.findOne({
        where: {
          id: object?.id,
        },
      });
      if (term) {
        term.name = object?.name;
        term.text = object?.text;
        term.type = object?.type;
        await term.save();
      }
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_EDIT_SETTING_EXCEPTION, exception?.message);
      return error.logAndReturn(this.logger);
    }
  }

  async activeTerm(input: any) {
    try {
      const object: Types.Classes.CTerm = Types.Classes.CTerm.fromObject(input);
      const term = await DBModels.TermModel.findOne({
        where: {
          id: object?.id,
        },
      });
      if (object?.active) {
        await term?.destroy();
      } else {
        await term?.restore();
      }
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_ACTIVE_SETTING_EXCEPTION, exception?.message);
      return error.logAndReturn(this.logger);
    }
  }

  validateObject(object: Types.Classes.CTerm) {
    return objHasProp(['name', 'text', 'active', 'type'], object);
  }
}
