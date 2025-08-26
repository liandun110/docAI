import React from 'react';

// 辅助函数，将英文检查项映射为中文
const checkKeyToName = {
  format_compliance: '格式合规性',
  terminology_consistency: '术语一致性',
  normative_language: '规范性语言',
  content_logic: '内容逻辑性',
  reference_accuracy: '引用文件准确性'
};

// 辅助函数，根据严重程度返回不同的CSS类
const getSeverityClassName = (severity) => {
  switch (severity) {
    case '严重':
      return 'severity-high';
    case '一般':
      return 'severity-medium';
    case '建议':
      return 'severity-low';
    default:
      return '';
  }
};

function ReviewResult({ data }) {
  if (!data) {
    return null;
  }

  const {
    standard_name = '未命名标准',
    standard_type = '未知类型',
    overall_assessment = '无总体评估。',
    overall_score = 'N/A',
    detailed_checks = {},
    issues_and_suggestions = []
  } = data;

  return (
    <div className="review-result">
      <header className="result-header">
        <h2>审核报告: {standard_name}</h2>
        <div className="standard-meta">
          <span><strong>标准类型:</strong> {standard_type}</span>
        </div>
      </header>

      <div className="result-section">
        <h3>总体评估</h3>
        <p>{overall_assessment}</p>
      </div>

      <div className="result-section">
        <h3>详细检查结果</h3>
        <table className="result-table">
          <thead>
            <tr>
              <th>检查项</th>
              <th>得分 (0-10)</th>
              <th>结论</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(detailed_checks).map(([key, value]) => (
              <tr key={key}>
                <td>{checkKeyToName[key] || key}</td>
                <td>{value.score !== undefined ? value.score : 'N/A'}</td>
                <td>{value.findings || '无'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {issues_and_suggestions && issues_and_suggestions.length > 0 && (
        <div className="result-section">
          <h3>发现的问题与修改建议</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>条款号</th>
                <th>问题原文</th>
                <th>问题描述</th>
                <th>修改建议</th>
                <th>严重程度</th>
              </tr>
            </thead>
            <tbody>
              {issues_and_suggestions.map((issue, index) => (
                <tr key={index}>
                  <td>{issue.clause || 'N/A'}</td>
                  <td>{issue.original_text || 'N/A'}</td>
                  <td>{issue.issue_description || 'N/A'}</td>
                  <td>{issue.suggestion || 'N/A'}</td>
                  <td className={getSeverityClassName(issue.severity)}>
                    {issue.severity || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReviewResult;