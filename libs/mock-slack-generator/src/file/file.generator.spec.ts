// import type { RandomGenerator } from '../random';
// import type { File } from './file';
// import { FileGenerator } from './file.generator';

// const generator = {
//   memberId: jest.fn(),
//   teamId: jest.fn(),
//   avatar: jest.fn(),
//   name: jest.fn(),
//   username: jest.fn(),
// } as unknown as RandomGenerator;

// const mockGenerator = (
//   id: string,
//   teamId: string,
//   memberId: string,
//   filename: string,
//   ext: string,
//   mimeType: string,
//   size: number,
// ) => {
//   jest.mocked(generator.fileId).mockReturnValueOnce(id);
//   jest.mocked(generator.memberId).mockReturnValueOnce(memberId);
//   jest.mocked(generator.teamId).mockReturnValueOnce(teamId);
//   jest.mocked(generator.file).mockReturnValueOnce({
//     name: filename,
//     filename: `${filename}.${ext}`,
//     ext,
//     mimeType,
//     size
//   });
//   jest.mocked(generator.fileUrl).mockReturnValueOnce(`https://files.slack.com/${filename}.${ext}`);
// };

// const assertFile = (
//   file: File,
//   id: string,
//   teamId: string,
//   memberId: string,
//   filename: string,
//   ext: string,
//   mimeType: string,
//   size: number,
// ) => {
//   expect(file).toEqual(
//     expect.objectContaining({
//       id,
//       name: `${filename}.${ext}`,
//       title: filename,
//       mimetype: mimeType,
//       filetype: ext,
//       user: memberId,
//       user_team: teamId,
//       size: size,
//       url_private: `https://files.slack.com/${filename}.${ext}`,
//       url_private_download: `https://files.slack.com/${filename}.${ext}`,
//     }),
//   );
// };

// // describe('FileGenerator', () => {
// //   it('should generate a random file', () => {
// //     mockGenerator(
// //       'U1A00',
// //       'T1234',
// //       'John',
// //       'Smith',
// //       'john1234',
// //       'http://avatar.com/a.png',
// //     );

// //     const file = new FileGenerator({
// //       randomGenerator: generator,
// //     }).generateFile();

// //     assertFile(
// //       member,
// //       'U1A00',
// //       'T1234',
// //       'John',
// //       'Smith',
// //       'john1234',
// //       'http://avatar.com/a.png',
// //     );
// //   });

// //   it('should use supplied team ID', () => {
// //     mockGenerator(
// //       'U1A00',
// //       'T1234',
// //       'John',
// //       'Smith',
// //       'john1234',
// //       'http://avatar.com/a.png',
// //     );

// //     const member = new MemberGenerator({
// //       randomGenerator: generator,
// //       teamId: 'T9999',
// //     }).generateMember();

// //     assertMember(
// //       member,
// //       'U1A00',
// //       'T9999',
// //       'John',
// //       'Smith',
// //       'john1234',
// //       'http://avatar.com/a.png',
// //     );
// //   });

// //   it('should generate multiple members', () => {
// //     mockGenerator(
// //       'U1A01',
// //       'T1001',
// //       'John',
// //       'Smith',
// //       'john1234',
// //       'http://avatar.com/a.png',
// //     );

// //     mockGenerator(
// //       'U1A02',
// //       'T1001',
// //       'Jill',
// //       'Jones',
// //       'jill1234',
// //       'http://avatar.com/b.png',
// //     );

// //     const [member1, member2] = new MemberGenerator({
// //       randomGenerator: generator,
// //     }).generateMembers(2);

// //     expect(member1).toBeDefined();
// //     expect(member2).toBeDefined();

// //     assertMember(
// //       member1 as Member,
// //       'U1A01',
// //       'T1001',
// //       'John',
// //       'Smith',
// //       'john1234',
// //       'http://avatar.com/a.png',
// //     );

// //     assertMember(
// //       member2 as Member,
// //       'U1A02',
// //       'T1001',
// //       'Jill',
// //       'Jones',
// //       'jill1234',
// //       'http://avatar.com/b.png',
// //     );
// //   });
// // });
