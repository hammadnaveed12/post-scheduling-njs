<<<<<<< Updated upstream
export default class ScoialMedia {
  constructor() {
    if (new.target == ScoialMedia) {
      console.log('Cannot instantiate an abstract class directly.');
    }
  }

  async generateAuthUrl(args: any): Promise<any> {}
  async Authorize(args: any): Promise<any> {}

  async SaveToSupabase(args: any): Promise<any> {}

  async PostContent(content: any): Promise<any> {}
}
=======
export default class ScoialMedia {
  constructor() {
    if (new.target == ScoialMedia) {
      console.log('Cannot instantiate an abstract class directly.');
    }
  }

  async generateAuthUrl(args: any): Promise<any> {}
  async Authorize(args: any): Promise<any> {}

  async SaveToSupabase(args: any): Promise<any> {}

  async PostContent(content: any): Promise<any> {}
}
>>>>>>> Stashed changes
