import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShareTargetService } from '../../../services/share-target.service';

@Component({
  selector: 'app-share-handler',
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-screen bg-gray-50">
      <p class="text-gray-500">Processing shared link...</p>
    </div>
  `,
})
export class ShareHandlerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shareTarget = inject(ShareTargetService);

  ngOnInit(): void {
    const url = this.route.snapshot.queryParamMap.get('url');
    const title = this.route.snapshot.queryParamMap.get('title');
    this.shareTarget.handleIncomingShare(url, title);
  }
}
