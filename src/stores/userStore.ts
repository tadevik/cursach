import { defineStore } from 'pinia';
import { User, Users } from 'src/components/models';
import { useWorkerStore } from './workerStore';
import { useRecordStore } from './recordStore';

export const useUserStore = defineStore('users', {
  state: () => ({
    users: <Users>{},
    currentUser: <number | undefined>undefined,
    currentType: <number | undefined>undefined,
    currentUserObj: <User | undefined>undefined,
    active: <number[]>[],
    archive: <number[]>[],
  }),

  getters: {
    getCurrentUserName: (state) => {
      if (state.currentUserObj === undefined) return '';
      return useWorkerStore().getWorkerById(state.currentUserObj?.worker)?.name;
    },
  },

  actions: {
    async login(name: string, pass: string): Promise<boolean> {
      return await fetch(this.server_ip.concat('login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ name: name, pass: pass }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            this.currentUser = result.id;
            this.currentUserObj = {
              id: result.id,
              name: name,
              password: pass,
              worker: result.worker,
              type: result.type,
            };
            this.currentType = result.type;
            document.cookie =
              'user=' + name + '; max-age=3600; SameSite=None; Secure';
            document.cookie =
              'pass=' + pass + '; max-age=3600; SameSite=None; Secure';
            useRecordStore().getRecords();
            if (this.currentType === 0) {
              this.getUsers();
            }
            this.router.push('/');
            return true;
          } else {
            return false;
          }
        });
    },

    async getUsers() {
      fetch(this.server_ip.concat('user'), {
        method: 'GET',
      })
        .then((val) => val.json())
        .then((res) => {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          res.users.forEach((val: any) => {
            this.users[val[0]] = {
              id: val[0],
              name: val[1],
              password: val[2],
              worker: val[3],
              type: val[4],
            };
          });
        });
    },

    logout() {
      this.currentUser = undefined;
      this.currentType = undefined;
      document.cookie =
        'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
      document.cookie =
        'pass=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
      window.location.reload();
    },
    async register(user: User) {
      fetch(this.server_ip.concat('register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          name: user.name,
          pass: user.password,
          worker: user.worker,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            user.id = result.id;
            this.currentUser = result.id;
            this.currentUserObj = user;
            this.currentType = result.type;
            document.cookie =
              'user=' +
              this.currentUser +
              '; max-age=3600; SameSite=None; Secure';
            this.router.push('/');
            return true;
          } else {
            return false;
          }
        });
      return false;
    },

    getUserActive(active: boolean) {
      return active ? this.active : this.archive;
    },

    async sendToArchive(id: number) {
      this.active.splice(
        this.active.findIndex((val) => val == id),
        1
      );
      this.archive.push(id);

      fetch(this.server_ip.concat('archive'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          id: id,
        }),
      });
    },

    setUser(user: User) {
      this.users[user.id] = user;
      console.log(user);
      fetch(this.server_ip.concat('user/').concat(user.id.toString()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          password: user.password,
          worker: user.worker,
        }),
      });
    },
    deleteUser(id: number) {
      fetch(this.server_ip.concat('user/').concat(id.toString()), {
        method: 'DELETE',
      });
    },
  },
});
