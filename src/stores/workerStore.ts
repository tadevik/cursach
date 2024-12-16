import { defineStore } from 'pinia';
import { Workers, Worker } from 'src/components/models';

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    workers: <Workers>{},
    isLoaded: false,
  }),

  getters: {},

  actions: {
    async getWorkers() {
      fetch(this.server_ip.concat('worker'), {
        method: 'GET',
      })
        .then((val) => val.json())
        .then((res) => {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          res.workers.forEach((val: any) => {
            this.workers[val[0]] = {
              id: val[0],
              name: val[1],
              role: val[2],
              depart: val[3],
            };
          });
          this.isLoaded = true;
        });
    },

    getWorkerById(id: number) {
      return this.workers[id];
    },

    async createNewWorker(worker: Worker) {
      fetch(this.server_ip.concat('worker'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(worker),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            worker.id = res.id;
            this.workers[worker.id] = worker;
            return worker.id;
          } else {
            return -1;
          }
        });
      return -1;
    },
    setWorker(worker: Worker) {
      this.workers[worker.id] = worker;
      fetch(this.server_ip.concat('worker/').concat(worker.id.toString()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(worker),
      });
    },
    deleteWorker(id: number) {
      fetch(this.server_ip.concat('worker/').concat(id.toString()), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      }).then(() => {
        window.location.reload();
      });
    },
  },
});
