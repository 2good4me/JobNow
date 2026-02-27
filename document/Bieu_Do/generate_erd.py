import json

TABLES = [
    {"name": "NGUOI_DUNG", "id": "t_nguoi_dung", "x": 1000, "y": 800, "cols": [("id", "INT", "PK"), ("phone", "VARCHAR", ""), ("role", "ENUM", ""), ("status", "ENUM", ""), ("account_tier", "TINYINT", ""), ("reputation_score", "INT", ""), ("wallet_balance", "DECIMAL", "")]},
    {"name": "HO_SO", "id": "t_ho_so", "x": 500, "y": 800, "cols": [("user_id", "INT", "PK/FK"), ("full_name", "VARCHAR", ""), ("date_of_birth", "DATE", ""), ("address", "VARCHAR", "")]},
    {"name": "THEO_DOI", "id": "t_theo_doi", "x": 1000, "y": 400, "cols": [("follower_id", "INT", "PK/FK"), ("following_id", "INT", "PK/FK"), ("created_at", "DATETIME", "")]},
    {"name": "THIET_BI_VI_PHAM", "id": "t_thiet_bi_vi_pham", "x": 1000, "y": 1200, "cols": [("device_id", "VARCHAR", "PK"), ("ip_address", "VARCHAR", ""), ("reason", "VARCHAR", "")]},
    
    {"name": "DANH_MUC", "id": "t_danh_muc", "x": 1500, "y": 200, "cols": [("id", "INT", "PK"), ("name", "VARCHAR", "")]},
    {"name": "VIEC_LAM", "id": "t_viec_lam", "x": 1500, "y": 500, "cols": [("id", "INT", "PK"), ("employer_id", "INT", "FK"), ("category_id", "INT", "FK"), ("title", "VARCHAR", ""), ("salary", "DECIMAL", ""), ("status", "ENUM", "")]},
    {"name": "CA_LAM_VIEC", "id": "t_ca_lam_viec", "x": 2000, "y": 500, "cols": [("id", "INT", "PK"), ("job_id", "INT", "FK"), ("work_date", "DATE", ""), ("start_time", "TIME", ""), ("end_time", "TIME", ""), ("needed_quantity", "INT", ""), ("status", "ENUM", "")]},
    {"name": "DON_UNG_TUYEN", "id": "t_don_ung_tuyen", "x": 2500, "y": 500, "cols": [("id", "INT", "PK"), ("shift_id", "INT", "FK"), ("candidate_id", "INT", "FK"), ("status", "ENUM", "")]},
    {"name": "CHAM_CONG", "id": "t_cham_cong", "x": 3000, "y": 500, "cols": [("id", "INT", "PK"), ("application_id", "INT", "FK"), ("check_in_time", "DATETIME", ""), ("check_out_time", "DATETIME", ""), ("status", "ENUM", "")]},
    
    {"name": "LICH_SU_GIAO_DICH", "id": "t_lich_su", "x": 1500, "y": 1100, "cols": [("id", "INT", "PK"), ("user_id", "INT", "FK"), ("amount", "DECIMAL", ""), ("type", "ENUM", "")]},
    {"name": "DANH_GIA", "id": "t_danh_gia", "x": 2000, "y": 800, "cols": [("id", "INT", "PK"), ("job_id", "INT", "FK"), ("reviewer_id", "INT", "FK"), ("reviewee_id", "INT", "FK"), ("rating", "TINYINT", "")]},
    {"name": "BAO_CAO", "id": "t_bao_cao", "x": 1000, "y": 1600, "cols": [("id", "INT", "PK"), ("reporter_id", "INT", "FK"), ("reported_user_id", "INT", "FK"), ("reason", "VARCHAR", "")]},
    {"name": "TIN_NHAN", "id": "t_tin_nhan", "x": 1500, "y": 800, "cols": [("id", "INT", "PK"), ("sender_id", "INT", "FK"), ("receiver_id", "INT", "FK"), ("content", "TEXT", ""), ("job_id", "INT", "FK")]},
    {"name": "THONG_BAO", "id": "t_thong_bao", "x": 500, "y": 1100, "cols": [("id", "INT", "PK"), ("user_id", "INT", "FK"), ("title", "VARCHAR", ""), ("content", "VARCHAR", ""), ("is_read", "BOOLEAN", "")]},
    {"name": "VIEC_DA_LUU", "id": "t_viec_da_luu", "x": 1500, "y": 1500, "cols": [("id", "INT", "PK"), ("user_id", "INT", "FK"), ("job_id", "INT", "FK")]},

    {"name": "MA_XAC_THUC", "id": "t_ma_xac_thuc", "x": 500, "y": 1500, "cols": [("id", "INT", "PK"), ("phone", "VARCHAR", ""), ("otp_code", "VARCHAR", ""), ("expired_at", "DATETIME", "")]},
    {"name": "THONG_KE_DOANH_THU", "id": "t_thong_ke", "x": 500, "y": 400, "cols": [("date", "DATE", "PK"), ("total_revenue", "DECIMAL", ""), ("active_users", "INT", "")]}
]

RELS = [
    ("t_ho_so", "t_nguoi_dung", "1-1"),
    ("t_theo_doi", "t_nguoi_dung", "N-1"),
    ("t_viec_lam", "t_nguoi_dung", "N-1"),
    ("t_viec_lam", "t_danh_muc", "N-1"),
    ("t_ca_lam_viec", "t_viec_lam", "N-1"),
    ("t_don_ung_tuyen", "t_ca_lam_viec", "N-1"),
    ("t_don_ung_tuyen", "t_nguoi_dung", "N-1"),
    ("t_cham_cong", "t_don_ung_tuyen", "N-1"),
    ("t_lich_su", "t_nguoi_dung", "N-1"),
    ("t_danh_gia", "t_viec_lam", "N-1"),
    ("t_danh_gia", "t_nguoi_dung", "N-1"),
    ("t_bao_cao", "t_nguoi_dung", "N-1"),
    ("t_tin_nhan", "t_nguoi_dung", "N-1"),
    ("t_tin_nhan", "t_viec_lam", "N-1"),
    ("t_thong_bao", "t_nguoi_dung", "N-1"),
    ("t_viec_da_luu", "t_nguoi_dung", "N-1"),
    ("t_viec_da_luu", "t_viec_lam", "N-1")
]

xml_parts = []
xml_parts.append('<?xml version="1.0" encoding="UTF-8"?>')
xml_parts.append('<mxfile host="app.diagrams.net" modified="2026-02-26T12:00:00.000Z" agent="Mozilla/5.0" version="22.1.2">')
xml_parts.append('  <diagram id="erd_jobnow" name="JobNow ERD">')
xml_parts.append('    <mxGraphModel dx="3000" dy="2000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">')
xml_parts.append('      <root>')
xml_parts.append('        <mxCell id="0" />')
xml_parts.append('        <mxCell id="1" parent="0" />')

for table in TABLES:
    width = 250
    height = 40 + len(table["cols"]) * 30
    
    xml_parts.append(f'''        <mxCell id="{table['id']}" value="{table['name']}" style="swimlane;fontStyle=1;align=center;verticalAlign=middle;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;fontFamily=Helvetica;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="{table['x']}" y="{table['y']}" width="{width}" height="{height}" as="geometry" />
        </mxCell>''')

    for i, col in enumerate(table["cols"]):
        c_name, c_type, c_key = col
        val = f"{c_name}: {c_type}"
        if c_key:
            val += f" ({c_key})"
        
        iconStyle = "fontStyle=4;" if "PK" in c_key else ""
        xml_parts.append(f'''        <mxCell id="{table['id']}_c{i}" value="{val}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=10;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontFamily=Helvetica;{iconStyle}" vertex="1" parent="{table['id']}">
          <mxGeometry x="0" y="{40 + i*30}" width="{width}" height="30" as="geometry" />
        </mxCell>''')

edge_idx = 0
for src, dst, rel in RELS:
    edge_idx += 1
    edge_id = f"edge_{edge_idx}"
    xml_parts.append(f'''        <mxCell id="{edge_id}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=crow;startArrow=none;endFill=0;startFill=0;" edge="1" parent="1" source="{src}" target="{dst}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>''')

xml_parts.append('      </root>')
xml_parts.append('    </mxGraphModel>')
xml_parts.append('  </diagram>')
xml_parts.append('</mxfile>')

with open(r'c:\Users\phand\Desktop\WorkSpace\Gps\document\Bieu_Do\JobNow_ERD.drawio', 'w', encoding='utf-8') as f:
    f.write('\n'.join(xml_parts))

print("Successfully generated ERD!")
