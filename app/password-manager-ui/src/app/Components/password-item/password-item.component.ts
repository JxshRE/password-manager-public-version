import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-item',
  templateUrl: './password-item.component.html',
  styleUrls: ['./password-item.component.scss']
})
export class PasswordItemComponent implements AfterViewInit {

  @Input() title: string = '';
  @Input() username: string = '';
  @Input() active: string = '';
  @Input() pwId: string = '';
  @Output() outIsCtx = new EventEmitter<string>();
  @Output() outToDel = new EventEmitter<string>();

  @ViewChild('ctx') ctx?: ElementRef;
  @ViewChild('ctxopen') ctxopen?: ElementRef;

  public x = 0;
  public y = 0;
  public showCtxMenu = false;
  constructor(private r: Renderer2, private router: Router){
  }

  ngAfterViewInit(): void {
    // This listens for a click on the context menu toggle button to which it will show the context menu by enabling the showCtxMenu variable
    this.r.listen('window', 'click', (event: Event) => {
      
      if (this.ctx == undefined){
        return;
      }
      if (this.showCtxMenu && event.target != this.ctx?.nativeElement && event.target != this.ctxopen?.nativeElement && !this.ctx?.nativeElement.contains(event.target)){
        this.showCtxMenu = false;
      }
    })
  }

  // This will output to call the deletion of the password specified. This is handled by its parent component.
  delpw(){
    this.outIsCtx.emit(this.pwId);
    this.outToDel.emit(this.pwId);
  }

  // This shows the context menu at the position of the users cursor on the page
  showctx(event: MouseEvent){
    this.x = event.clientX;
    this.y = event.clientY;
    this.showCtxMenu = !this.showCtxMenu;
    this.outIsCtx.emit(this.pwId);
  }

  // This calls to view the password entry
  viewpw(){
    this.router.navigate(['/view', `${this.pwId}`])
  }
}
