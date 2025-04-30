import React from 'react';
import { Card, Progress, Typography, Space, Row, Col, Statistic } from 'antd';
import { BookOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import './LMS.css';

const { Title, Text } = Typography;

const LMS: React.FC = () => {
  // Mock data - replace with actual data from your backend
  const courses = [
    {
      id: 1,
      title: 'Introduction to Audit',
      progress: 75,
      duration: '2h 30m',
      status: 'In Progress',
    },
    {
      id: 2,
      title: 'Financial Reporting Standards',
      progress: 30,
      duration: '4h 15m',
      status: 'In Progress',
    },
    {
      id: 3,
      title: 'Risk Assessment',
      progress: 0,
      duration: '3h 45m',
      status: 'Not Started',
    },
  ];

  return (
    <div className="lms-container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Title level={2}>My Learning Dashboard</Title>
        </Col>
        
        {/* Quick Stats */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Learning Time"
                  value={12}
                  suffix="hours"
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Courses Enrolled"
                  value={3}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Achievements"
                  value={5}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Course Progress */}
        <Col span={24}>
          <Card title="My Courses">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {courses.map((course) => (
                <Card key={course.id} className="course-card">
                  <Row align="middle" gutter={[16, 16]}>
                    <Col span={16}>
                      <Title level={4}>{course.title}</Title>
                      <Space>
                        <Text type="secondary">{course.duration}</Text>
                        <Text type={course.status === 'In Progress' ? 'warning' : 'secondary'}>
                          {course.status}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={8}>
                      <Progress percent={course.progress} status={course.progress === 100 ? 'success' : 'active'} />
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LMS; 