import { defineStore } from 'pinia';

import { Depart, Departs } from 'src/components/models';

export const useDepartStore = defineStore('depart', {
  state: () => ({
    departs: <Departs>{},
    isLoaded: false,
  }),

  getters: {},

  actions: {
    async getDeparts() {
      fetch(this.server_ip.concat('depart'), {
        method: 'GET',
      })
        .then((val) => val.json())
        .then((res) => {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          res.departs.forEach((val: any) => {
            this.departs[val[0]] = {
              id: val[0],
              name: val[1],
            };
          });
          this.isLoaded = true;
        });
    },

    getDepartById(id: number) {
      return this.departs[id];
    },

    async createDepart(depart: Depart) {
      fetch(this.server_ip.concat('depart'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(depart),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            depart.id = res.id;
            this.departs[depart.id] = depart;
            return depart.id;
          } else {
            return -1;
          }
        });
      return -1;
    },
    setDepart(val: Depart) {
      this.departs[val.id] = val;
      fetch(this.server_ip.concat('depart/').concat(val.id.toString()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ id: val.id, name: val.name }),
      });
    },
  },
});
