import { Progress } from '../entities/progress.entity';

export namespace ProgressResponse {
  export interface GetList {
    progress: Progress[];
  }

  export interface GetById {
    progress: Progress;
  }

  export interface Create {
    created: Progress;
  }

  export interface Update {
    updated: Progress;
  }

  export interface Delete {
    deleted: number;
  }
}
