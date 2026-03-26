"""数据导出工具 — Excel/CSV 生成"""
import csv
import os
from datetime import datetime

EXPORT_DIR = "/tmp/pms_exports"
os.makedirs(EXPORT_DIR, exist_ok=True)


def export_to_csv(data: list, columns: list, file_name: str) -> str:
    """导出为 CSV，返回文件路径"""
    file_path = os.path.join(EXPORT_DIR, f"{file_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
    if not data:
        with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow([c['title'] for c in columns])
        return file_path

    with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow([c['title'] for c in columns])
        for row in data:
            writer.writerow([row.get(c['key'], '') for c in columns])
    return file_path


def export_hazards(data: list) -> str:
    columns = [
        {'key': 'hazard_no', 'title': '隐患编号'},
        {'key': 'type', 'title': '类型'},
        {'key': 'urgency', 'title': '紧急程度'},
        {'key': 'status', 'title': '状态'},
        {'key': 'description', 'title': '描述'},
        {'key': 'location', 'title': '位置'},
        {'key': 'reporter_name', 'title': '上报人'},
        {'key': 'created_at', 'title': '上报时间'},
    ]
    return export_to_csv(data, columns, 'hazards')


def export_reports(data: list) -> str:
    columns = [
        {'key': 'report_no', 'title': '报告编号'},
        {'key': 'type', 'title': '类型'},
        {'key': 'status', 'title': '状态'},
        {'key': 'period_start', 'title': '开始时间'},
        {'key': 'period_end', 'title': '结束时间'},
        {'key': 'created_by_name', 'title': '创建人'},
        {'key': 'created_at', 'title': '创建时间'},
    ]
    return export_to_csv(data, columns, 'reports')


def export_risks(data: list) -> str:
    columns = [
        {'key': 'title', 'title': '风险标题'},
        {'key': 'category', 'title': '类别'},
        {'key': 'level', 'title': '等级'},
        {'key': 'probability', 'title': '概率'},
        {'key': 'impact', 'title': '影响'},
        {'key': 'status', 'title': '状态'},
        {'key': 'mitigation', 'title': '缓解措施'},
    ]
    return export_to_csv(data, columns, 'risks')


def export_contracts(data: list) -> str:
    columns = [
        {'key': 'code', 'title': '合同编号'},
        {'key': 'name', 'title': '合同名称'},
        {'key': 'contract_type', 'title': '类型'},
        {'key': 'party_a', 'title': '甲方'},
        {'key': 'party_b', 'title': '乙方'},
        {'key': 'amount', 'title': '金额'},
        {'key': 'status', 'title': '状态'},
    ]
    return export_to_csv(data, columns, 'contracts')
