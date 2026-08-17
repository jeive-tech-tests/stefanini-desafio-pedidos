import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

export interface UiPageChange {
  page?: number;
  first?: number;
  rows?: number;
  pageCount?: number;
}

@Component({
  selector: 'app-ui-table',
  imports: [NgTemplateOutlet, PaginatorModule, TableModule],
  templateUrl: './ui-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableComponent {
  @Input() value: readonly unknown[] = [];
  @Input({ required: true }) headerTemplate!: TemplateRef<unknown>;
  @Input({ required: true }) rowTemplate!: TemplateRef<{ $implicit: unknown }>;
  @Input() dataKey = 'id';
  @Input() first = 0;
  @Input() rows = 10;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20];
  @Input() currentPageReportTemplate = 'Mostrando {first} a {last} de {totalRecords} registros';
  @Output() pageChange = new EventEmitter<UiPageChange>();
}
