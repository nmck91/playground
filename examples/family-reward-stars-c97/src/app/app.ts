import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // DataService will auto-initialize with default data if needed
    console.log('Family Reward Chart App initialized');
  }
}
