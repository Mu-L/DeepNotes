import { bytesToBase64 } from '@stdlib/base64';
import { DataLayer } from '@stdlib/crypto';
import { computeGroupPasswordValues } from 'src/code/crypto';
import { groupAccessKeyrings } from 'src/code/pages/computed/group-access-keyrings';
import { groupContentKeyrings } from 'src/code/pages/computed/group-content-keyrings';

export async function enableGroupPasswordProtection(
  groupId: string,
  { groupPassword }: { groupPassword: string },
) {
  // Get group content keyring

  let groupContentKeyring = await groupContentKeyrings()(groupId).getAsync();

  if (groupContentKeyring == null) {
    throw new Error('Group keyring not found.');
  }

  if (groupContentKeyring.topLayer !== DataLayer.Raw) {
    throw new Error('Invalid group content keyring.');
  }

  // Password protect group keyring

  const groupPasswordValues = await computeGroupPasswordValues(
    groupId,
    groupPassword,
  );

  groupContentKeyring = groupContentKeyring.wrapSymmetric(
    groupPasswordValues.passwordKey,
    {
      associatedData: {
        context: 'GroupContentKeyringPasswordProtection',
        groupId,
      },
    },
  );

  // Wrap content keyring with group keyring

  const accessKeyring = await groupAccessKeyrings()(groupId).getAsync();

  if (accessKeyring?.topLayer !== DataLayer.Raw) {
    throw new Error('Invalid group keyring.');
  }

  groupContentKeyring = groupContentKeyring.wrapSymmetric(accessKeyring, {
    associatedData: {
      context: 'GroupContentKeyring',
      groupId,
    },
  });

  // Send password enable request

  await api().post(`api/groups/${groupId}/password/enable`, {
    groupPasswordHash: bytesToBase64(groupPasswordValues.passwordHash),

    groupEncryptedContentKeyring: bytesToBase64(
      groupContentKeyring.wrappedValue,
    ),
  });
}
