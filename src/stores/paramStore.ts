import { defineStore } from 'pinia';
import { Param, Params } from 'src/components/models';

export const useParamStore = defineStore('param', {
  state: () => ({
    params: <Params>{},
    isLoaded: false,
  }),

  getters: {},

  actions: {
    async getParams() {
      fetch(this.server_ip.concat('param'), {
        method: 'GET',
      })
        .then((val) => val.json())
        .then((res) => {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          res.params.forEach((val: any) => {
            this.params[val[0]] = {
              id: val[0],
              name: val[1],
              weight: val[2],
              type: val[3],
            };
          });
          this.isLoaded = true;
        });
    },

    getParamsByType(type: number) {
      const paramKeys = Object.keys(this.params).filter((param) => {
        return (
          this.params[Number(param)].type == type ||
          this.params[Number(param)].type == 0
        );
      });
      const newObj = <Params>{};
      for (const i of paramKeys) {
        newObj[Number(i)] = this.params[Number(i)];
      }
      return newObj;
    },

    async createNewParam(param: Param) {
      fetch(this.server_ip.concat('param'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(param),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            param.id = res.id;
            this.params[param.id] = param;
            return param.id;
          } else {
            return -1;
          }
        });
      return -1;
    },
    setParam(val: Param) {
      this.params[val.id] = val;
      fetch(this.server_ip.concat('param/').concat(val.id.toString()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(val),
      });
    },
  },
});
