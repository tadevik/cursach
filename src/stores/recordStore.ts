import { defineStore } from 'pinia';

import { Comment, Recordings } from 'src/components/models';
import { useWorkerStore } from './workerStore';
import { useDepartStore } from './departStore';
import { useUserStore } from './userStore';

export const useRecordStore = defineStore('records', {
  state: () => ({
    records: <Recordings>{},
    isLoaded: false,
  }),

  getters: {},

  actions: {
    getRecords() {
      fetch(
        this.server_ip
          .concat('record/')
          .concat(useUserStore().currentUser?.toString() as string),
        {
          method: 'GET',
        }
      )
        .then((val) => val.json())
        .then((res) => {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          res.records.forEach((val: any) => {
            if (val[6] !== 0) {
              this.records[val[0]] = {
                id: val[0],
                record: val[1],
                cust_num: val[2],
                worker_id: val[3],
                time: val[4],
                length: val[5],
                status: val[6],
                type: val[7],
                rating: {},
                comments: [],
              };
              if (val[6] === 1) {
                useUserStore().active.push(val[0]);
              } else {
                useUserStore().archive.push(val[0]);
              }
            }
          });
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          Object.values(res.comments).forEach((val: any) => {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            val.forEach((objVal: any[]) => {
              this.records[objVal[1]].comments.push({
                id: objVal[0],
                author: objVal[2],
                comment: objVal[3],
                type: objVal[4],
                time: objVal[5],
                date: objVal[6],
              });
            });

            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            Object.values(res.ratings).forEach((val: any) => {
              val.forEach((objVal: number[]) => {
                this.records[objVal[1]].rating[objVal[2]] = objVal[0];
              });
            });
          });

          this.isLoaded = true;
        });
    },
    getRecordById(id: number) {
      return this.records[id];
    },
    getRecordsByList(list: Array<number>) {
      if (list === undefined || Object.keys(this.records).length === 0)
        return {};
      const obj = list.reduce((obj: Recordings, val: number) => {
        obj[val] = this.records[val];
        return obj;
      }, {});
      return obj;
    },
    getRecordWorker(id: number) {
      if (
        useWorkerStore().getWorkerById(this.records[id].worker_id) === undefined
      )
        return undefined;
      return useWorkerStore().getWorkerById(this.records[id].worker_id);
    },
    getRecordDepartName(id: number) {
      return useDepartStore().getDepartById(id).name;
    },

    ifRatingExists(id: number) {
      return this.records[id].rating !== undefined;
    },
    async setRating(id: number, ratings: Record<number, number>) {
      this.records[id].rating = ratings;
      fetch(this.server_ip.concat('rate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ id: id, ratings: ratings }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            return;
          } else {
            console.log('error');
          }
        });
    },
    getRating(id: number) {
      return this.records[id].rating;
    },
    sendRating(id: number) {
      useUserStore().sendToArchive(id);
    },

    async newComment(id: number, comment: Comment) {
      if (this.records[id].comments === undefined) {
        this.records[id].comments = [];
      }
      comment.id = this.records[id].comments?.length as number;
      this.records[id].comments?.push(comment);
      fetch(this.server_ip.concat('comment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ id: id, comments: comment }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            comment.id = res.id;
            return;
          } else {
            console.log('error');
          }
        });
    },
    async setCommentText(id: number, comment_id: number, text: string) {
      const newComment = this.records[id].comments?.find(
        (val) => val.id === comment_id
      );
      if (newComment === undefined) return;
      newComment.comment = text;
      fetch(this.server_ip.concat('comment/').concat(comment_id.toString()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ id: id, comments: newComment }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            return;
          } else {
            console.log('error');
          }
        });
    },
    async deleteComment(id: number, comment_id: number) {
      if (this.records[id].comments === undefined) return;
      const deletedRecord = this.records[id].comments?.findIndex(
        (val) => val.id == comment_id
      );
      if (deletedRecord !== -1) {
        this.records[id].comments?.splice(deletedRecord as number, 1);
      }
      fetch(this.server_ip.concat('comment/').concat(comment_id.toString()), {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status) {
            return;
          } else {
            console.log('error');
          }
        });
    },

    deleteRecord(id: number) {
      delete this.records[id];
      fetch(this.server_ip.concat('record/').concat(id.toString()), {
        method: 'DELETE',
      }).then(() => {
        window.location.reload();
      });
    },
  },
});
