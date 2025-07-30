"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectEventProgressLog = void 0;
const typeorm_1 = require("typeorm");
const project_event_entity_1 = require("./project-event.entity");
let ProjectEventProgressLog = class ProjectEventProgressLog {
};
exports.ProjectEventProgressLog = ProjectEventProgressLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectEventProgressLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectEventProgressLog.prototype, "projectEventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], ProjectEventProgressLog.prototype, "change", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectEventProgressLog.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ProjectEventProgressLog.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProjectEventProgressLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProjectEventProgressLog.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_event_entity_1.ProjectEvent, projectEvent => projectEvent.progressLogs),
    (0, typeorm_1.JoinColumn)({ name: 'projectEventId' }),
    __metadata("design:type", project_event_entity_1.ProjectEvent)
], ProjectEventProgressLog.prototype, "projectEvent", void 0);
exports.ProjectEventProgressLog = ProjectEventProgressLog = __decorate([
    (0, typeorm_1.Entity)('project_event_progress_logs')
], ProjectEventProgressLog);
//# sourceMappingURL=project-event-progress-log.entity.js.map